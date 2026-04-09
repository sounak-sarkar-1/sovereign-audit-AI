import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuditReport, ReportStatus } from '../../database/entities/audit-report.entity';
import { ClientReportFeedback } from '../../database/entities/client-report-feedback.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { SubmitReportFeedbackDto } from './dto/submit-feedback.dto';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class ClientReportsService {
  private readonly logger = new Logger(ClientReportsService.name);

  constructor(
    @InjectRepository(AuditReport)
    private readonly reportRepo: Repository<AuditReport>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(clientId: string) {
    return this.reportRepo.find({
      where: { audit: { clientId }, status: ReportStatus.SENT_FOR_CLIENT_REVIEW || ReportStatus.FINAL },
      relations: ['audit', 'file'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, clientId: string) {
    const report = await this.reportRepo.findOne({
      where: { id, audit: { clientId } },
      relations: ['audit', 'file', 'feedbacks'],
    });

    if (!report || report.status === ReportStatus.DRAFT) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async submitFeedback(id: string, dto: SubmitReportFeedbackDto, clientId: string) {
    const report = await this.reportRepo.findOne({
      where: { id, audit: { clientId } },
      relations: ['audit'],
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.SENT_FOR_CLIENT_REVIEW) {
      throw new BadRequestException('Feedback can only be submitted for reports pending review');
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create feedback records
      const feedbackEntities = dto.feedback.map(f => manager.create(ClientReportFeedback, {
        reportId: id,
        sectionName: f.sectionName,
        status: f.status,
        comment: f.comment,
        createdBy: clientId,
      }));
      await manager.save(feedbackEntities);

      // 2. Update Audit status back to Under Manager Review
      report.audit.status = AuditStatus.UNDER_MANAGER_REVIEW;
      await manager.save(report.audit);

      // 3. Notify manager
      await this.notificationsService.create({
        userId: report.audit.managerId,
        type: NotificationType.CLIENT_FEEDBACK_RECEIVED,
        title: 'Report Feedback Received',
        message: `Client has submitted feedback for the audit report of ${report.audit.name}`,
        relatedEntityType: 'AuditReport',
        relatedEntityId: report.id,
        metadata: { auditId: report.auditId },
      });

      return { message: 'Feedback submitted successfully' };
    });
  }

  async download(id: string, clientId: string) {
    const report = await this.findOne(id, clientId);
    if (!report.fileId) {
      throw new NotFoundException('Report file not found');
    }
    return report.file;
  }
}
