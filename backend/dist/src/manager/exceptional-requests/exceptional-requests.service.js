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
var ManagerExceptionalRequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerExceptionalRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let ManagerExceptionalRequestsService = ManagerExceptionalRequestsService_1 = class ManagerExceptionalRequestsService {
    constructor(auditRepo, requestRepo, userRepo, notificationsService, auditTrailService) {
        this.auditRepo = auditRepo;
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(ManagerExceptionalRequestsService_1.name);
    }
    async create(auditId, dto, manager) {
        const audit = await this.auditRepo.findOne({ where: { id: auditId } });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (dto.actionType === exceptional_action_request_entity_1.ExceptionalActionType.DELETE) {
            if (![audit_entity_1.AuditStatus.DRAFT, audit_entity_1.AuditStatus.IN_PROGRESS].includes(audit.status)) {
                throw new common_1.UnprocessableEntityException('Deletion can only be requested for draft or in-progress audits');
            }
        }
        else if (dto.actionType === exceptional_action_request_entity_1.ExceptionalActionType.REOPEN) {
            if (audit.status !== audit_entity_1.AuditStatus.CLOSED) {
                throw new common_1.UnprocessableEntityException('Reopening can only be requested for closed audits');
            }
        }
        const existing = await this.requestRepo.findOne({
            where: { auditId, status: exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING },
        });
        if (existing) {
            throw new common_1.UnprocessableEntityException({
                code: 'BUSINESS_RULE_ERROR',
                message: 'A pending exceptional action request already exists for this audit',
            });
        }
        const request = this.requestRepo.create({
            auditId,
            actionType: dto.actionType,
            justification: dto.justification,
            status: exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING,
            requestedById: manager.id,
        });
        const saved = await this.requestRepo.save(request);
        const admins = await this.userRepo.find({
            where: { role: user_entity_1.UserRole.ADMIN },
        });
        for (const admin of admins) {
            await this.notificationsService.create({
                userId: admin.id,
                type: notification_entity_1.NotificationType.EXCEPTIONAL_REQUEST_RAISED,
                title: 'Exceptional Action Request',
                message: `Manager ${manager.fullName} requested ${dto.actionType} for audit ${audit.name}`,
                relatedEntityType: 'ExceptionalActionRequest',
                relatedEntityId: saved.id,
                metadata: { auditId },
            });
        }
        await this.auditTrailService.log({
            actorId: manager.id,
            actorRole: manager.role,
            action: audit_trail_service_1.AuditAction.EXCEPTIONAL_REQUEST_RAISED,
            entityType: 'ExceptionalActionRequest',
            entityId: saved.id,
            metadata: { auditId, actionType: dto.actionType },
        });
        return saved;
    }
};
exports.ManagerExceptionalRequestsService = ManagerExceptionalRequestsService;
exports.ManagerExceptionalRequestsService = ManagerExceptionalRequestsService = ManagerExceptionalRequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(1, (0, typeorm_1.InjectRepository)(exceptional_action_request_entity_1.ExceptionalActionRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        audit_trail_service_1.AuditTrailService])
], ManagerExceptionalRequestsService);
//# sourceMappingURL=exceptional-requests.service.js.map