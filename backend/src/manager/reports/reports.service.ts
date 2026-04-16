import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
import * as ExcelJS from 'exceljs';

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

      // Calculate compliance percentage
      const lineItems = await managerEm.find(AuditScopeLineItem, {
        where: { auditId },
        relations: ['responses'],
      });

      const totalWeightage = lineItems.reduce(
        (sum, li) => sum + Number(li.weightage || 0),
        0,
      );
      if (Math.abs(totalWeightage - 100) > 0.05) {
        throw new BadRequestException(
          `Audit scope weightages must sum to 100% before generating a report. Current total: ${totalWeightage}%`,
        );
      }

      const activeItems = lineItems.filter(
        (li) => li.status !== LineItemStatus.EXCEPTION_APPROVED,
      );
      const activeWeightageSum = activeItems.reduce(
        (sum, li) => sum + Number(li.weightage || 0),
        0,
      );

      let totalContribution = 0;
      for (const item of activeItems) {
        const response = item.responses.find((r) => !r.isDraft);
        if (!response || response.complianceScore === null) {
          throw new UnprocessableEntityException(
            `All submitted items must have a compliance score before generating the report. Item: ${item.name}`,
          );
        }

        const adjustedWeight =
          (Number(item.weightage || 0) / activeWeightageSum) * 100;
        const scoreContribution =
          ((response.complianceScore - 1) / 4) * adjustedWeight;
        totalContribution += scoreContribution;
      }

      const compliancePercentage = Math.round(totalContribution * 100) / 100;

      const report = managerEm.create(AuditReport, {
        auditId,
        version,
        status: ReportStatus.DRAFT,
        compliancePercentage,
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

      this.logger.log(`Created AI Job ${savedJob.id} for Audit ${auditId}`);

      // Publish to pg-boss
      try {
        await this.aiJobsService.send('report-generation', {
          jobId: savedJob.id,
          reportId: savedReport.id,
          auditId,
        });
        this.logger.log(`Sent report-generation job for Audit ${auditId}`);
      } catch (err) {
        this.logger.error(`Failed to send report-generation job: ${err.message}`, err.stack);
        throw new InternalServerErrorException('Failed to dispatch background job');
      }

      return { reportId: savedReport.id, jobId: savedJob.id };
    });
  }

  async findAll(auditId: string) {
    this.logger.log(`Fetching reports for audit: ${auditId}`);
    try {
      const reports = await this.reportRepo.find({
        where: { auditId },
        relations: ['file', 'feedbacks'],
        order: { version: 'DESC' },
      });
      this.logger.log(`Found ${reports.length} reports for audit ${auditId}`);
      return reports;
    } catch (err) {
      this.logger.error(`Failed to fetch reports for audit ${auditId}: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Database error while fetching reports');
    }
  }

  async sendToClient(auditId: string, reportId: string, manager: User) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
      relations: ['audit', 'audit.client'],
    });
    if (!report) throw new NotFoundException('Report not found');
    if (!report.fileId)
      throw new BadRequestException(
        'Report file has not been generated yet. Please wait for generation to complete before sending.',
      );
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

    if (
      report.status !== ReportStatus.FEEDBACK_SUBMITTED &&
      report.status !== ReportStatus.SENT_FOR_CLIENT_REVIEW
    ) {
      throw new BadRequestException(
        'Only reports sent for review or with submitted feedback can be finalized.',
      );
    }

    report.status = ReportStatus.FINAL;
    await this.reportRepo.save(report);

    report.audit.status = AuditStatus.CLOSED;
    await this.auditRepo.save(report.audit);

    // Notify both manager and client
    const notifyUsers = [report.audit.managerId, report.audit.clientId];
    for (const userId of notifyUsers) {
      if (!userId) continue;
      await this.notificationsService.create({
        userId,
        type: NotificationType.AUDIT_CLOSED,
        title: 'Audit Finalized',
        message: `Audit Project ${report.audit.name} has been closed and finalized.`,
        relatedEntityType: 'Audit',
        relatedEntityId: report.auditId,
        metadata: { auditId: report.auditId, reportId: report.id },
      });
    }

    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.REPORT_FINALIZED,
      entityType: 'AuditReport',
      entityId: report.id,
      metadata: { auditId: report.auditId, version: report.version },
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

  async exportLineItems(auditId: string, manager: User, res: Response) {
    // 1. Fetch audit with businessUnits
    const audit = await this.auditRepo.findOne({
      where: { id: auditId },
      relations: ['businessUnits', 'businessUnits.businessUnit'],
    });
    if (!audit) throw new NotFoundException('Audit not found');

    // 2. Validate audit is at least under_manager_review
    const allowedStatuses = [
      AuditStatus.UNDER_MANAGER_REVIEW,
      AuditStatus.PENDING_CLIENT_REVIEW,
      AuditStatus.CLOSED,
      AuditStatus.ARCHIVED,
    ];
    if (!allowedStatuses.includes(audit.status)) {
      throw new BadRequestException(
        'Line item export is only available after all items are submitted.',
      );
    }

    // 3. Fetch all line items with their responses and exceptions
    const lineItems = await this.lineItemRepo.find({
      where: { auditId },
      relations: [
        'auditBusinessUnit',
        'auditBusinessUnit.businessUnit',
        'responses',
        'exceptionRequests',
      ],
      order: { auditBusinessUnitId: 'ASC', displayOrder: 'ASC' },
    });

    // 4. Calculate total weightage of non-exception items for weighted contribution
    const nonExceptionItems = lineItems.filter(
      (item) => item.status !== LineItemStatus.EXCEPTION_APPROVED,
    );
    const totalNonExceptionWeight = nonExceptionItems.reduce(
      (sum, item) => sum + Number(item.weightage || 0),
      0,
    );

    // 5. Build Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sovereign Audit AI';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Audit Line Items', {
      pageSetup: { fitToPage: true, orientation: 'landscape' },
    });

    // 6. Header row styling
    sheet.columns = [
      { header: 'Business Unit', key: 'bu', width: 22 },
      { header: 'Line Item', key: 'name', width: 35 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Input Method', key: 'inputMethod', width: 18 },
      { header: 'Auditor Score (1–5)', key: 'score', width: 18 },
      { header: 'Status', key: 'status', width: 22 },
      { header: 'Exception Raised', key: 'exRaised', width: 18 },
      { header: 'Exception Status', key: 'exStatus', width: 18 },
      { header: 'Weightage (%)', key: 'weightage', width: 16 },
      { header: 'Weighted Contribution (%)', key: 'contribution', width: 22 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4B2D7F' }, // Sovereign Audit purple
    };
    headerRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    headerRow.height = 30;

    // 7. Add data rows
    for (const item of lineItems) {
      const latestResponse = item.responses?.[item.responses.length - 1];
      const latestException =
        item.exceptionRequests?.[item.exceptionRequests.length - 1];
      const isExcluded = item.status === LineItemStatus.EXCEPTION_APPROVED;

      const score = latestResponse?.complianceScore ?? null;
      const weightage = item.weightage ?? null;

      let contribution: string | number = 'N/A';
      if (isExcluded) {
        contribution = 'Excluded';
      } else if (
        score !== null &&
        weightage !== null &&
        totalNonExceptionWeight > 0
      ) {
        const adjustedWeight = (Number(weightage) / totalNonExceptionWeight) * 100;
        contribution = parseFloat(
          (((Number(score) - 1) / 4) * adjustedWeight).toFixed(2),
        );
      }

      const statusLabel: Record<string, string> = {
        not_started: 'Not Started',
        draft_saved: 'Draft Saved',
        submitted: 'Submitted',
        exception_pending: 'Exception Pending',
        exception_approved: 'Exception Approved',
        exception_rejected: 'Exception Rejected',
        returned: 'Returned',
      };

      const inputMethodLabel: Record<string, string> = {
        free_text: 'Free Text',
        multiple_choice: 'Multiple Choice',
      };

      const row = sheet.addRow({
        bu:
          item.auditBusinessUnit?.businessUnit?.name ||
          '—',
        name: item.name,
        description: item.description || '—',
        inputMethod: inputMethodLabel[item.inputMethod] || item.inputMethod,
        score: score ?? '—',
        status: statusLabel[item.status] || item.status,
        exRaised: latestException ? 'Yes' : 'No',
        exStatus: latestException
          ? latestException.status.charAt(0).toUpperCase() +
            latestException.status.slice(1)
          : 'N/A',
        weightage: weightage !== null ? `${weightage}%` : '—',
        contribution:
          contribution !== 'N/A' && contribution !== 'Excluded'
            ? `${contribution}%`
            : contribution,
      });

      // Colour rows: exception rows in light orange, normal in alternating white/light grey
      if (isExcluded) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3E0' },
        };
      } else if (sheet.rowCount % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        };
      }
      row.alignment = { vertical: 'middle', wrapText: true };
      row.height = 22;
    }

    // 8. Add summary rows at bottom
    sheet.addRow([]);
    const totalItems = lineItems.length;
    const excludedItems = lineItems.filter(
      (i) => i.status === LineItemStatus.EXCEPTION_APPROVED,
    ).length;
    const submittedItems = lineItems.filter(
      (i) => i.status === LineItemStatus.SUBMITTED,
    ).length;

    const summaryRows = [
      ['Total Line Items', totalItems],
      ['Submitted', submittedItems],
      ['Exception Approved (Excluded)', excludedItems],
      ['Audit Name', audit.name],
      ['Export Date', new Date().toLocaleDateString('en-IN')],
    ];

    for (const [label, value] of summaryRows) {
      const r = sheet.addRow(['', '', '', '', '', '', '', '', label, value]);
      r.getCell(9).font = { bold: true };
      r.getCell(10).alignment = { horizontal: 'left' };
    }

    // 9. Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // 10. Stream to response
    const filename = `${audit.name.replace(/\s+/g, '_')}_LineItems_${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await workbook.xlsx.write(res);
    res.end();
  }
}
