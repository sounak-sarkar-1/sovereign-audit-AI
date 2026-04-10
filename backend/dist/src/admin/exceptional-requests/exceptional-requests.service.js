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
var AdminExceptionalRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminExceptionalRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_trail_log_entity_1 = require("../../database/entities/audit-trail-log.entity");
const files_service_1 = require("../../shared/files/files.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
const notification_entity_1 = require("../../database/entities/notification.entity");
let AdminExceptionalRequestsService = AdminExceptionalRequestsService_1 = class AdminExceptionalRequestsService {
    constructor(requestRepository, auditRepository, auditTrailRepository, filesService, notificationsService) {
        this.requestRepository = requestRepository;
        this.auditRepository = auditRepository;
        this.auditTrailRepository = auditTrailRepository;
        this.filesService = filesService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(AdminExceptionalRequestsService_1.name);
    }
    async findAll(status) {
        const where = status ? { status } : {};
        return await this.requestRepository.find({
            where,
            relations: ['audit', 'requester', 'audit.client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const request = await this.requestRepository.findOne({
            where: { id },
            relations: ['audit', 'requester', 'audit.client'],
        });
        if (!request) {
            throw new common_1.NotFoundException(`Exceptional request with ID ${id} not found`);
        }
        return request;
    }
    async approve(id, adminId, file, adminComment) {
        const request = await this.findOne(id);
        if (request.status !== exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING) {
            throw new common_1.BadRequestException(`Request is already ${request.status}`);
        }
        if (!file) {
            throw new common_1.BadRequestException('Evidence file is required to approve an exceptional request');
        }
        const uploadedFile = await this.filesService.uploadFile(file, adminId, uploaded_file_entity_1.FileEntityType.EXCEPTIONAL_ACTION_EVIDENCE, request.id);
        request.status = exceptional_action_request_entity_1.ExceptionalRequestStatus.APPROVED;
        request.resolvedAt = new Date();
        request.resolvedById = adminId;
        request.adminComment = adminComment;
        request.evidenceFileId = uploadedFile.id;
        await this.requestRepository.save(request);
        const audit = await this.auditRepository.findOne({ where: { id: request.auditId } });
        if (!audit) {
            throw new common_1.NotFoundException(`Audit ${request.auditId} not found`);
        }
        if (request.actionType === exceptional_action_request_entity_1.ExceptionalActionType.DELETE) {
            audit.deletedAt = new Date();
            await this.auditRepository.save(audit);
            await this.auditTrailRepository.save(this.auditTrailRepository.create({
                actorUserId: adminId,
                actorRole: 'admin',
                actionType: 'AUDIT_DELETED',
                entityType: 'audit',
                entityId: audit.id,
                payload: { requestId: request.id },
            }));
        }
        else if (request.actionType === exceptional_action_request_entity_1.ExceptionalActionType.REOPEN) {
            audit.status = audit_entity_1.AuditStatus.REOPENED;
            audit.deletedAt = null;
            await this.auditRepository.save(audit);
            await this.auditTrailRepository.save(this.auditTrailRepository.create({
                actorUserId: adminId,
                actorRole: 'admin',
                actionType: 'AUDIT_REOPENED',
                entityType: 'audit',
                entityId: audit.id,
                payload: { requestId: request.id },
            }));
        }
        await this.notificationsService.create({
            userId: request.requestedById,
            type: notification_entity_1.NotificationType.EXCEPTIONAL_REQUEST_RESOLVED,
            title: `Exceptional Request Approved`,
            message: `Your request to ${request.actionType} audit "${audit.name}" has been approved by the admin.`,
            relatedEntityType: 'exceptional_action_request',
            relatedEntityId: request.id,
            metadata: { auditId: request.auditId },
        });
        return request;
    }
    async reject(id, adminId, adminComment) {
        const request = await this.findOne(id);
        if (request.status !== exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING) {
            throw new common_1.BadRequestException(`Request is already ${request.status}`);
        }
        if (!adminComment || adminComment.trim().length < 10) {
            throw new common_1.BadRequestException('Admin comment must be at least 10 characters for rejection');
        }
        request.status = exceptional_action_request_entity_1.ExceptionalRequestStatus.REJECTED;
        request.resolvedAt = new Date();
        request.resolvedById = adminId;
        request.adminComment = adminComment;
        await this.requestRepository.save(request);
        await this.notificationsService.create({
            userId: request.requestedById,
            type: notification_entity_1.NotificationType.EXCEPTIONAL_REQUEST_RESOLVED,
            title: `Exceptional Request Rejected`,
            message: `Your request to ${request.actionType} audit has been rejected. Comment: ${adminComment}`,
            relatedEntityType: 'exceptional_action_request',
            relatedEntityId: request.id,
            metadata: { auditId: request.auditId },
        });
        return request;
    }
};
exports.AdminExceptionalRequestsService = AdminExceptionalRequestsService;
exports.AdminExceptionalRequestsService = AdminExceptionalRequestsService = AdminExceptionalRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exceptional_action_request_entity_1.ExceptionalActionRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_trail_log_entity_1.AuditTrailLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService,
        notifications_service_1.NotificationsService])
], AdminExceptionalRequestsService);
//# sourceMappingURL=exceptional-requests.service.js.map