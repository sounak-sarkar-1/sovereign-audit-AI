import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import {
  AuditReport,
  ReportStatus,
} from '../../database/entities/audit-report.entity';
import {
  AuditScopeLineItem,
  LineItemStatus,
} from '../../database/entities/audit-scope-line-item.entity';
import {
  AiJob,
  JobType,
  JobStatus,
} from '../../database/entities/ai-job.entity';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';
import { User } from '../../database/entities/user.entity';
import { FilesService } from '../../shared/files/files.service';
import { Response } from 'express';
import { FileEntityType } from '../../database/entities/uploaded-file.entity';

@Injectable()
export class ManagerReportsService {
  private readonly logger = new Logger(ManagerReportsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditReport)
    private readonly reportRepo: Repository<AuditReport>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(AiJob)
    private readonly aiJobRepo: Repository<AiJob>,
    private readonly aiJobsService: AiJobsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {}

  async generate(auditId: string, manager: User) {
    // 1. Validate readiness
    const audit = await this.auditRepo.findOne({
      where: { id: auditId },
      relations: ['client'],
    });
    if (!audit) throw new NotFoundException('Audit not found');

    const incompleteItems = await this.lineItemRepo
      .createQueryBuilder('li')
      .where('li.auditId = :auditId', { auditId })
      .andWhere('li.isOptional = false')
      .andWhere('li.status NOT IN (:...validStatuses)', {
        validStatuses: [
          LineItemStatus.SUBMITTED,
          LineItemStatus.EXCEPTION_APPROVED,
        ],
      })
      .getMany();

    if (incompleteItems.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Audit contains incomplete mandatory items',
        items: incompleteItems.map((i) => ({ id: i.id, name: i.name })),
      });
    }

    // 2. Start transaction
    return await this.dataSource.transaction(async (managerEm) => {
      // Create Report record
      const lastReport = await managerEm.findOne(AuditReport, {
        where: { auditId },
        order: { version: 'DESC' },
      });
      const version = (lastReport?.version || 0) + 1;

      const report = managerEm.create(AuditReport, {
        auditId,
        version,
        status: ReportStatus.DRAFT,
      });
      const savedReport = await managerEm.save(report);

      // Update Audit status
      audit.status = AuditStatus.UNDER_MANAGER_REVIEW;
      await managerEm.save(audit);

      // Create AI Job
      const aiJob = managerEm.create(AiJob, {
        jobType: JobType.REPORT_GENERATION,
        status: JobStatus.QUEUED,
        auditId,
        createdBy: manager.id,
        inputPayload: { reportId: savedReport.id, auditId },
      });
      const savedJob = await managerEm.save(aiJob);

      // Publish to pg-boss
      await this.aiJobsService.send('report-generation', {
        jobId: savedJob.id,
        reportId: savedReport.id,
        auditId,
      });

      return { reportId: savedReport.id, jobId: savedJob.id };
    });
  }

  async findAll(auditId: string) {
    return this.reportRepo.find({
      where: { auditId },
      relations: ['file'],
      order: { version: 'DESC' },
    });
  }

  async sendToClient(auditId: string, reportId: string, manager: User) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
      relations: ['audit', 'audit.client'],
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.DRAFT)
      throw new BadRequestException('Only draft reports can be sent to client');

    report.status = ReportStatus.SENT_FOR_CLIENT_REVIEW;
    await this.reportRepo.save(report);

    report.audit.status = AuditStatus.PENDING_CLIENT_REVIEW;
    await this.auditRepo.save(report.audit);

    await this.notificationsService.create({
      userId: report.audit.clientId,
      type: NotificationType.REPORT_READY,
      title: 'Audit Report Received',
      message: `Project ${report.audit.name} report is ready for your review.`,
      relatedEntityType: 'AuditReport',
      relatedEntityId: report.id,
      metadata: { auditId: report.auditId },
    });

    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.REPORT_SENT_TO_CLIENT,
      entityType: 'AuditReport',
      entityId: report.id,
      metadata: { auditId: report.auditId },
    });

    return { message: 'Report sent to client' };
  }

  async finalize(auditId: string, reportId: string, manager: User) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
      relations: ['audit'],
    });
    if (!report) throw new NotFoundException('Report not found');

    report.status = ReportStatus.FINAL;
    await this.reportRepo.save(report);

    report.audit.status = AuditStatus.CLOSED;
    await this.auditRepo.save(report.audit);

    // Notify both
    const notifyUsers = [report.audit.managerId, report.audit.clientId];
    for (const userId of notifyUsers) {
      await this.notificationsService.create({
        userId,
        type: NotificationType.AUDIT_CLOSED,
        title: 'Audit Finalized',
        message: `Audit Project ${report.audit.name} has been closed and finalized.`,
        relatedEntityType: 'Audit',
        relatedEntityId: report.auditId,
        metadata: { auditId: report.auditId },
      });
    }

    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.AUDIT_CLOSED,
      entityType: 'Audit',
      entityId: report.auditId,
      metadata: { reportId: report.id },
    });

    return { message: 'Audit finalized and closed' };
  }

  async download(auditId: string, reportId: string, res: Response) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId, auditId },
      relations: ['file'],
    });
    if (!report) throw new NotFoundException('Report not found');
    if (!report.file)
      throw new BadRequestException(
        'Report file has not been generated yet. Please wait for AI generation to complete.',
      );

    return this.filesService.streamFile(report.file, res);
  }

  async uploadVersion(
    auditId: string,
    reportId: string,
    file: Express.Multer.File,
    manager: User,
  ) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId, auditId },
    });
    if (!report) throw new NotFoundException('Report not found');

    const uploadedFile = await this.filesService.uploadFile(
      file,
      manager.id,
      FileEntityType.AUDIT_REPORT,
      report.id,
    );

    report.fileId = uploadedFile.id;
    await this.reportRepo.save(report);

    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.REPORT_GENERATED, // Or a new action like REPORT_UPLOADED if defined
      entityType: 'AuditReport',
      entityId: report.id,
      metadata: { auditId, version: report.version },
    });

    return report;
  }
}
