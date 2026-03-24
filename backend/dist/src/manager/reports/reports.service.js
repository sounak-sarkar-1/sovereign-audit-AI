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
var ManagerReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_report_entity_1 = require("../../database/entities/audit-report.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const ai_jobs_service_1 = require("../../shared/ai-jobs/ai-jobs.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let ManagerReportsService = ManagerReportsService_1 = class ManagerReportsService {
    constructor(auditRepo, reportRepo, lineItemRepo, aiJobRepo, aiJobsService, notificationsService, auditTrailService, dataSource) {
        this.auditRepo = auditRepo;
        this.reportRepo = reportRepo;
        this.lineItemRepo = lineItemRepo;
        this.aiJobRepo = aiJobRepo;
        this.aiJobsService = aiJobsService;
        this.notificationsService = notificationsService;
        this.auditTrailService = auditTrailService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ManagerReportsService_1.name);
    }
    async generate(auditId, manager) {
        const audit = await this.auditRepo.findOne({ where: { id: auditId }, relations: ['client'] });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        const incompleteItems = await this.lineItemRepo.createQueryBuilder('li')
            .where('li.auditId = :auditId', { auditId })
            .andWhere('li.isOptional = false')
            .andWhere('li.status NOT IN (:...validStatuses)', {
            validStatuses: [audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED, audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED]
        })
            .getMany();
        if (incompleteItems.length > 0) {
            throw new common_1.UnprocessableEntityException({
                message: 'Audit contains incomplete mandatory items',
                items: incompleteItems.map(i => ({ id: i.id, name: i.name })),
            });
        }
        return await this.dataSource.transaction(async (managerEm) => {
            const lastReport = await managerEm.findOne(audit_report_entity_1.AuditReport, {
                where: { auditId },
                order: { version: 'DESC' },
            });
            const version = (lastReport?.version || 0) + 1;
            const report = managerEm.create(audit_report_entity_1.AuditReport, {
                auditId,
                version,
                status: audit_report_entity_1.ReportStatus.DRAFT,
            });
            const savedReport = await managerEm.save(report);
            audit.status = audit_entity_1.AuditStatus.UNDER_MANAGER_REVIEW;
            await managerEm.save(audit);
            const aiJob = managerEm.create(ai_job_entity_1.AiJob, {
                jobType: ai_job_entity_1.JobType.REPORT_GENERATION,
                status: ai_job_entity_1.JobStatus.QUEUED,
                auditId,
                createdBy: manager.id,
                inputPayload: { reportId: savedReport.id, auditId },
            });
            const savedJob = await managerEm.save(aiJob);
            await this.aiJobsService.send('report-generation', {
                jobId: savedJob.id,
                reportId: savedReport.id,
                auditId
            });
            return { reportId: savedReport.id, jobId: savedJob.id };
        });
    }
    async findAll(auditId) {
        return this.reportRepo.find({
            where: { auditId },
            relations: ['file'],
            order: { version: 'DESC' },
        });
    }
    async sendToClient(auditId, reportId, manager) {
        const report = await this.reportRepo.findOne({ where: { id: reportId }, relations: ['audit', 'audit.client'] });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        if (report.status !== audit_report_entity_1.ReportStatus.DRAFT)
            throw new common_1.BadRequestException('Only draft reports can be sent to client');
        report.status = audit_report_entity_1.ReportStatus.SENT_FOR_CLIENT_REVIEW;
        await this.reportRepo.save(report);
        report.audit.status = audit_entity_1.AuditStatus.PENDING_CLIENT_REVIEW;
        await this.auditRepo.save(report.audit);
        await this.notificationsService.create({
            userId: report.audit.clientId,
            type: notification_entity_1.NotificationType.REPORT_READY,
            title: 'Audit Report Received',
            message: `Project ${report.audit.name} report is ready for your review.`,
            relatedEntityType: 'AuditReport',
            relatedEntityId: report.id,
            metadata: { auditId: report.auditId },
        });
        await this.auditTrailService.log({
            actorId: manager.id,
            actorRole: manager.role,
            action: audit_trail_service_1.AuditAction.REPORT_SENT_TO_CLIENT,
            entityType: 'AuditReport',
            entityId: report.id,
            metadata: { auditId: report.auditId },
        });
        return { message: 'Report sent to client' };
    }
    async finalize(auditId, reportId, manager) {
        const report = await this.reportRepo.findOne({ where: { id: reportId }, relations: ['audit'] });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        report.status = audit_report_entity_1.ReportStatus.FINAL;
        await this.reportRepo.save(report);
        report.audit.status = audit_entity_1.AuditStatus.CLOSED;
        await this.auditRepo.save(report.audit);
        const notifyUsers = [report.audit.managerId, report.audit.clientId];
        for (const userId of notifyUsers) {
            await this.notificationsService.create({
                userId,
                type: notification_entity_1.NotificationType.AUDIT_CLOSED,
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
            action: audit_trail_service_1.AuditAction.AUDIT_CLOSED,
            entityType: 'Audit',
            entityId: report.auditId,
            metadata: { reportId: report.id },
        });
        return { message: 'Audit finalized and closed' };
    }
};
exports.ManagerReportsService = ManagerReportsService;
exports.ManagerReportsService = ManagerReportsService = ManagerReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_report_entity_1.AuditReport)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(3, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_jobs_service_1.AiJobsService,
        notifications_service_1.NotificationsService,
        audit_trail_service_1.AuditTrailService,
        typeorm_2.DataSource])
], ManagerReportsService);
//# sourceMappingURL=reports.service.js.map