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
var ClientReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_report_entity_1 = require("../../database/entities/audit-report.entity");
const client_report_feedback_entity_1 = require("../../database/entities/client-report-feedback.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let ClientReportsService = ClientReportsService_1 = class ClientReportsService {
    constructor(reportRepo, auditRepo, notificationsService, dataSource) {
        this.reportRepo = reportRepo;
        this.auditRepo = auditRepo;
        this.notificationsService = notificationsService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ClientReportsService_1.name);
    }
    async findAll(clientId) {
        return this.reportRepo.find({
            where: { audit: { clientId }, status: audit_report_entity_1.ReportStatus.SENT_FOR_CLIENT_REVIEW || audit_report_entity_1.ReportStatus.FINAL },
            relations: ['audit', 'file'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, clientId) {
        const report = await this.reportRepo.findOne({
            where: { id, audit: { clientId } },
            relations: ['audit', 'file', 'feedbacks'],
        });
        if (!report || report.status === audit_report_entity_1.ReportStatus.DRAFT) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async submitFeedback(id, dto, clientId) {
        const report = await this.reportRepo.findOne({
            where: { id, audit: { clientId } },
            relations: ['audit'],
        });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        if (report.status !== audit_report_entity_1.ReportStatus.SENT_FOR_CLIENT_REVIEW) {
            throw new common_1.BadRequestException('Feedback can only be submitted for reports pending review');
        }
        return await this.dataSource.transaction(async (manager) => {
            const feedbackEntities = dto.feedback.map(f => manager.create(client_report_feedback_entity_1.ClientReportFeedback, {
                reportId: id,
                sectionName: f.sectionName,
                status: f.status,
                comment: f.comment,
                createdBy: clientId,
            }));
            await manager.save(feedbackEntities);
            report.audit.status = audit_entity_1.AuditStatus.UNDER_MANAGER_REVIEW;
            await manager.save(report.audit);
            await this.notificationsService.create({
                userId: report.audit.managerId,
                type: notification_entity_1.NotificationType.CLIENT_FEEDBACK_RECEIVED,
                title: 'Report Feedback Received',
                message: `Client has submitted feedback for the audit report of ${report.audit.name}`,
                relatedEntityType: 'AuditReport',
                relatedEntityId: report.id,
                metadata: { auditId: report.auditId },
            });
            return { message: 'Feedback submitted successfully' };
        });
    }
    async download(id, clientId) {
        const report = await this.findOne(id, clientId);
        if (!report.fileId) {
            throw new common_1.NotFoundException('Report file not found');
        }
        return report.file;
    }
};
exports.ClientReportsService = ClientReportsService;
exports.ClientReportsService = ClientReportsService = ClientReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_report_entity_1.AuditReport)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        typeorm_2.DataSource])
], ClientReportsService);
//# sourceMappingURL=reports.service.js.map