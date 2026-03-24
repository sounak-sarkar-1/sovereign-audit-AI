"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportGenerationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerationWorker = void 0;
const common_1 = require("@nestjs/common");
const ai_jobs_service_1 = require("../ai-jobs.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_job_entity_1 = require("../../../database/entities/ai-job.entity");
const audit_report_entity_1 = require("../../../database/entities/audit-report.entity");
const audit_entity_1 = require("../../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../../database/entities/audit-scope-line-item.entity");
const exception_request_entity_1 = require("../../../database/entities/exception-request.entity");
const files_service_1 = require("../../files/files.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_entity_1 = require("../../../database/entities/notification.entity");
const docx_1 = require("docx");
let ReportGenerationWorker = ReportGenerationWorker_1 = class ReportGenerationWorker {
    constructor(aiJobsService, aiJobRepo, reportRepo, auditRepo, lineItemRepo, exceptionRepo, filesService, notificationsService, dataSource) {
        this.aiJobsService = aiJobsService;
        this.aiJobRepo = aiJobRepo;
        this.reportRepo = reportRepo;
        this.auditRepo = auditRepo;
        this.lineItemRepo = lineItemRepo;
        this.exceptionRepo = exceptionRepo;
        this.filesService = filesService;
        this.notificationsService = notificationsService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ReportGenerationWorker_1.name);
    }
    async onModuleInit() {
        await this.aiJobsService.work('report-generation', (job) => this.handleJob(job));
        this.logger.log('ReportGenerationWorker started');
    }
    async handleJob(job) {
        const { jobId, reportId, auditId } = job.data;
        try {
            await this.aiJobRepo.update(jobId, { status: ai_job_entity_1.JobStatus.PROCESSING });
            const audit = await this.auditRepo.findOne({
                where: { id: auditId },
                relations: ['client']
            });
            const lineItems = await this.lineItemRepo.find({
                where: { auditId },
                relations: ['auditBusinessUnit']
            });
            const exceptions = await this.exceptionRepo.find({
                where: { auditScopeLineItem: { auditId }, status: exception_request_entity_1.ExceptionStatus.APPROVED },
                relations: ['auditScopeLineItem', 'auditor']
            });
            const doc = new docx_1.Document({
                sections: [{
                        properties: {},
                        children: [
                            new docx_1.Paragraph({
                                text: "Audit Report",
                                heading: docx_1.HeadingLevel.TITLE,
                                alignment: docx_1.AlignmentType.CENTER,
                            }),
                            new docx_1.Paragraph({
                                text: `Project: ${audit.name}`,
                                heading: docx_1.HeadingLevel.HEADING_1,
                            }),
                            new docx_1.Paragraph({
                                text: `Client: ${audit.client?.fullName || 'N/A'}`,
                                spacing: { before: 200 },
                            }),
                            new docx_1.Paragraph({
                                text: "1. Executive Summary",
                                heading: docx_1.HeadingLevel.HEADING_2,
                                spacing: { before: 400 },
                            }),
                            new docx_1.Paragraph({
                                text: "This report summaries the findings of the internal audit conducted...",
                            }),
                            new docx_1.Paragraph({
                                text: "2. Exception Summary",
                                heading: docx_1.HeadingLevel.HEADING_2,
                                spacing: { before: 400 },
                            }),
                            ...exceptions.map(ex => new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: `[EXCEPTION] ${ex.auditScopeLineItem?.name}: `, bold: true, color: "FF0000" }),
                                    new docx_1.TextRun({ text: ex.justification, italics: true }),
                                ],
                                spacing: { before: 100 },
                            })),
                            new docx_1.Paragraph({
                                text: "3. Detailed Findings",
                                heading: docx_1.HeadingLevel.HEADING_2,
                                spacing: { before: 400 },
                            }),
                            new docx_1.Table({
                                width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                                rows: [
                                    new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "Item", bold: true })] })] }),
                                            new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: "Status", bold: true })] })] }),
                                        ],
                                    }),
                                    ...lineItems.map(li => new docx_1.TableRow({
                                        children: [
                                            new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: li.name })] }),
                                            new docx_1.TableCell({ children: [new docx_1.Paragraph({ text: li.status })] }),
                                        ],
                                    })),
                                ],
                            }),
                        ],
                    }],
            });
            const buffer = await docx_1.Packer.toBuffer(doc);
            const fileName = `Report_${audit.name}_v${reportId.substring(0, 4)}.docx`;
            const uploadedFile = await this.filesService.uploadFromBuffer(buffer, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', audit.managerId, 'reports');
            const reportToUpdate = await this.reportRepo.findOne({ where: { id: reportId } });
            if (reportToUpdate) {
                reportToUpdate.fileId = uploadedFile.id;
                await this.reportRepo.save(reportToUpdate);
            }
            await this.aiJobRepo.update(jobId, {
                status: ai_job_entity_1.JobStatus.COMPLETED,
                completedAt: new Date(),
                outputPayload: { fileId: uploadedFile.id },
            });
            await this.notificationsService.create({
                userId: audit.managerId,
                type: notification_entity_1.NotificationType.REPORT_READY,
                title: 'Report Generation Complete',
                message: `The report for ${audit.name} has been generated and is ready for review.`,
                relatedEntityType: 'AuditReport',
                relatedEntityId: reportId,
                metadata: { auditId },
            });
        }
        catch (error) {
            this.logger.error(`Report generation failed for job ${jobId}: ${error.message}`, error.stack);
            await this.aiJobRepo.update(jobId, {
                status: ai_job_entity_1.JobStatus.FAILED,
                errorMessage: error.message
            });
        }
    }
};
exports.ReportGenerationWorker = ReportGenerationWorker;
exports.ReportGenerationWorker = ReportGenerationWorker = ReportGenerationWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_report_entity_1.AuditReport)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(4, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(5, (0, typeorm_1.InjectRepository)(exception_request_entity_1.ExceptionRequest)),
    __metadata("design:paramtypes", [ai_jobs_service_1.AiJobsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService,
        notifications_service_1.NotificationsService,
        typeorm_2.DataSource])
], ReportGenerationWorker);
//# sourceMappingURL=report-generation.worker.js.map