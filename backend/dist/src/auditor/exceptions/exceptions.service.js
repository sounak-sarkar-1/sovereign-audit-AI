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
var AuditorExceptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorExceptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const exception_comment_entity_1 = require("../../database/entities/exception-comment.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let AuditorExceptionsService = AuditorExceptionsService_1 = class AuditorExceptionsService {
    constructor(exceptionRepo, lineItemRepo, auditRepo, fileRepo, auditBURepo, commentRepo, notificationsService, auditTrailService) {
        this.exceptionRepo = exceptionRepo;
        this.lineItemRepo = lineItemRepo;
        this.auditRepo = auditRepo;
        this.fileRepo = fileRepo;
        this.auditBURepo = auditBURepo;
        this.commentRepo = commentRepo;
        this.notificationsService = notificationsService;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(AuditorExceptionsService_1.name);
    }
    async findByAudit(auditId, user) {
        return this.exceptionRepo.find({
            where: { auditScopeLineItem: { auditId }, auditorId: user.id },
            relations: ['auditScopeLineItem'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAllGlobal(user) {
        return this.exceptionRepo.find({
            where: { auditorId: user.id },
            relations: ['auditScopeLineItem', 'manager'],
            order: { createdAt: 'DESC' },
        });
    }
    async create(auditId, user, dto) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        const lineItem = await this.lineItemRepo.findOne({
            where: { id: dto.lineItemId, auditId },
        });
        if (!lineItem)
            throw new common_1.NotFoundException('Line item not found in this audit');
        if (lineItem.status === audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED || lineItem.status === audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED) {
            throw new common_1.UnprocessableEntityException('Line item is already submitted or approved');
        }
        const existingRequest = await this.exceptionRepo.findOne({
            where: { auditScopeLineItemId: dto.lineItemId, status: (0, typeorm_2.In)(['pending']) },
        });
        if (existingRequest) {
            throw new common_1.UnprocessableEntityException('A pending exception request already exists for this line item');
        }
        const exception = this.exceptionRepo.create({
            auditScopeLineItemId: dto.lineItemId,
            auditorId: user.id,
            managerId: audit.managerId,
            justification: dto.justification,
        });
        await this.exceptionRepo.save(exception);
        if (dto.evidenceFileIds && dto.evidenceFileIds.length > 0) {
            this.logger.log(`Linking ${dto.evidenceFileIds.length} files to exception ${exception.id}`);
            await this.fileRepo.update({ id: (0, typeorm_2.In)(dto.evidenceFileIds), entityType: uploaded_file_entity_1.FileEntityType.EXCEPTION_EVIDENCE }, { entityId: exception.id });
        }
        lineItem.status = audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_PENDING;
        await this.lineItemRepo.save(lineItem);
        await this.notificationsService.create({
            userId: audit.managerId,
            type: notification_entity_1.NotificationType.EXCEPTION_RAISED,
            title: 'Exception Requested',
            message: `Auditor ${user.fullName} requested an exception for line item: ${lineItem.name}`,
            relatedEntityType: 'exception_request',
            relatedEntityId: exception.id,
            metadata: { auditId },
        });
        await this.auditTrailService.log({
            actorId: user.id,
            actorRole: user.role,
            action: audit_trail_service_1.AuditAction.EXCEPTION_RAISED,
            entityType: 'exception_request',
            entityId: exception.id,
            metadata: { auditId, lineItemId: dto.lineItemId },
        });
        return exception;
    }
    async getComments(exceptionId) {
        return this.commentRepo.find({
            where: { exceptionRequestId: exceptionId },
            relations: ['author'],
            order: { createdAt: 'ASC' },
        });
    }
    async addComment(exceptionId, user, content) {
        const comment = this.commentRepo.create({
            exceptionRequestId: exceptionId,
            authorId: user.id,
            content,
        });
        return this.commentRepo.save(comment);
    }
};
exports.AuditorExceptionsService = AuditorExceptionsService;
exports.AuditorExceptionsService = AuditorExceptionsService = AuditorExceptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exception_request_entity_1.ExceptionRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(3, (0, typeorm_1.InjectRepository)(uploaded_file_entity_1.UploadedFile)),
    __param(4, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __param(5, (0, typeorm_1.InjectRepository)(exception_comment_entity_1.ExceptionComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        audit_trail_service_1.AuditTrailService])
], AuditorExceptionsService);
//# sourceMappingURL=exceptions.service.js.map