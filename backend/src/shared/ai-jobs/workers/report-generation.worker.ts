import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { AiJobsService } from '../ai-jobs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AiJob, JobStatus } from '../../../database/entities/ai-job.entity';
import { AuditReport, ReportStatus } from '../../../database/entities/audit-report.entity';
import { Audit } from '../../../database/entities/audit.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest, ExceptionStatus } from '../../../database/entities/exception-request.entity';
import { FilesService } from '../../files/files.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../../database/entities/notification.entity';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  BorderStyle,
  AlignmentType
} from 'docx';

@Injectable()
export class ReportGenerationWorker implements OnModuleInit {
  private readonly logger = new Logger(ReportGenerationWorker.name);

  constructor(
    private readonly aiJobsService: AiJobsService,
    @InjectRepository(AiJob)
    private readonly aiJobRepo: Repository<AiJob>,
    @InjectRepository(AuditReport)
    private readonly reportRepo: Repository<AuditReport>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(ExceptionRequest)
    private readonly exceptionRepo: Repository<ExceptionRequest>,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.aiJobsService.work('report-generation', (job) => this.handleJob(job));
    this.logger.log('ReportGenerationWorker started');
  }

  private async handleJob(job: any) {
    const { jobId, reportId, auditId } = job.data;
    
    try {
      await this.aiJobRepo.update(jobId, { status: JobStatus.PROCESSING });

      // 1. Fetch Audit Data
      const audit = await this.auditRepo.findOne({ 
        where: { id: auditId }, 
        relations: ['client'] 
      });
      const lineItems = await this.lineItemRepo.find({ 
        where: { auditId },
        relations: ['auditBusinessUnit']
      });
      const exceptions = await this.exceptionRepo.find({
        where: { auditScopeLineItem: { auditId }, status: ExceptionStatus.APPROVED },
        relations: ['auditScopeLineItem', 'auditor']
      });

      // 2. Docx Generation (Simplified logic for now, using structured data)
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Audit Report",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Project: ${audit.name}`,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: `Client: ${audit.client?.fullName || 'N/A'}`,
              spacing: { before: 200 },
            }),
            
            new Paragraph({
              text: "1. Executive Summary",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: "This report summaries the findings of the internal audit conducted...",
            }),

            new Paragraph({
              text: "2. Exception Summary",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            ...exceptions.map(ex => new Paragraph({
              children: [
                new TextRun({ text: `[EXCEPTION] ${ex.auditScopeLineItem?.name}: `, bold: true, color: "FF0000" }),
                new TextRun({ text: ex.justification, italics: true }),
              ],
              spacing: { before: 100 },
            })),

            new Paragraph({
              text: "3. Detailed Findings",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            }),
            // Add table of line items
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                  ],
                }),
                ...lineItems.map(li => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: li.name })] }),
                    new TableCell({ children: [new Paragraph({ text: li.status })] }),
                  ],
                })),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      
      // 3. Save to storage
      const fileName = `Report_${audit.name}_v${reportId.substring(0, 4)}.docx`;
      const uploadedFile = await this.filesService.uploadFromBuffer(
        buffer,
        fileName,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        audit.managerId,
        'reports'
      );

      // 4. Update Database
      const reportToUpdate = await this.reportRepo.findOne({ where: { id: reportId } });
      if (reportToUpdate) {
        reportToUpdate.fileId = uploadedFile.id;
        await this.reportRepo.save(reportToUpdate);
      }
      
      await this.aiJobRepo.update(jobId, {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        outputPayload: { fileId: uploadedFile.id } as any,
      });

      // 5. Notify Manager
      await this.notificationsService.create({
        userId: audit.managerId,
        type: NotificationType.REPORT_READY,
        title: 'Report Generation Complete',
        message: `The report for ${audit.name} has been generated and is ready for review.`,
        relatedEntityType: 'AuditReport',
        relatedEntityId: reportId,
        metadata: { auditId },
      });

    } catch (error) {
      this.logger.error(`Report generation failed for job ${jobId}: ${error.message}`, error.stack);
      await this.aiJobRepo.update(jobId, { 
        status: JobStatus.FAILED, 
        errorMessage: error.message 
      });
    }
  }
}
