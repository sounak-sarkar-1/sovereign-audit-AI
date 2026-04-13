import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  AuditReport,
  ReportStatus,
} from '../../database/entities/audit-report.entity';
import { ClientReportFeedback } from '../../database/entities/client-report-feedback.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { SubmitReportFeedbackDto } from './dto/submit-feedback.dto';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';
import { FilesService } from '../../shared/files/files.service';
import { Response } from 'express';

@Injectable()
export class ClientReportsService {
  private readonly logger = new Logger(ClientReportsService.name);

  constructor(
    @InjectRepository(AuditReport)
    private readonly reportRepo: Repository<AuditReport>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(clientId: string) {
    return this.reportRepo.find({
      where: {
        audit: { clientId },
        status: In([
          ReportStatus.SENT_FOR_CLIENT_REVIEW,
          ReportStatus.FEEDBACK_SUBMITTED,
          ReportStatus.FINAL,
        ]),
      },
      relations: ['audit', 'file'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, clientId: string) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['audit', 'file'],
    });

    if (!report || report.audit?.clientId !== clientId || report.status === ReportStatus.DRAFT) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async submitFeedback(id: string, feedback: any[], clientId: string) {
    const report = await this.reportRepo.findOne({
      where: { id, audit: { clientId } },
      relations: ['audit'],
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.SENT_FOR_CLIENT_REVIEW) {
      throw new BadRequestException(
        'Feedback can only be submitted for reports pending review',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create feedback records
      const feedbackEntities = feedback.map((f) =>
        manager.create(ClientReportFeedback, {
          reportId: id,
          sectionName: f.sectionName,
          status: f.status,
          comment: f.comment,
          createdBy: clientId,
        }),
      );
      await manager.save(feedbackEntities);

      // 2. Update report status
      report.status = ReportStatus.FEEDBACK_SUBMITTED;
      await manager.save(report);

      // 3. Update Audit status back to Under Manager Review
      report.audit.status = AuditStatus.UNDER_MANAGER_REVIEW;
      await manager.save(report.audit);

      // 4. Notify manager
      await this.notificationsService.create({
        userId: report.audit.managerId,
        type: NotificationType.CLIENT_FEEDBACK_RECEIVED,
        title: 'Report Feedback Received',
        message: `Client has submitted feedback for the audit report of ${report.audit.name}`,
        relatedEntityType: 'AuditReport',
        relatedEntityId: report.id,
        metadata: { auditId: report.auditId },
      });

      // 5. Log audit trail
      await this.auditTrailService.log({
        actorId: clientId,
        action: AuditAction.CLIENT_FEEDBACK_SUBMITTED,
        entityType: 'AuditReport',
        entityId: report.id,
        metadata: { auditId: report.auditId },
      });

      return { message: 'Feedback submitted successfully' };
    });
  }

  async download(id: string, clientId: string, res: Response) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['audit', 'file'],
    });

    if (!report || report.audit?.clientId !== clientId) {
      throw new NotFoundException('Report not found');
    }
    if (!report.file)
      throw new BadRequestException('Report file not yet generated');
    return this.filesService.streamFile(report.file, res);
  }

}
