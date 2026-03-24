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
var ManagerExceptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerExceptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let ManagerExceptionsService = ManagerExceptionsService_1 = class ManagerExceptionsService {
    constructor(exceptionRepo, lineItemRepo, notificationsService, auditTrailService, dataSource) {
        this.exceptionRepo = exceptionRepo;
        this.lineItemRepo = lineItemRepo;
        this.notificationsService = notificationsService;
        this.auditTrailService = auditTrailService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ManagerExceptionsService_1.name);
    }
    async findAll(auditId, status) {
        const query = this.exceptionRepo.createQueryBuilder('er')
            .leftJoinAndSelect('er.auditScopeLineItem', 'li')
            .leftJoinAndSelect('er.auditor', 'auditor')
            .where('li.auditId = :auditId', { auditId });
        if (status) {
            query.andWhere('er.status = :status', { status });
        }
        return query.getMany();
    }
    async findAllGlobal(status, manager) {
        const query = this.exceptionRepo.createQueryBuilder('er')
            .leftJoinAndSelect('er.auditScopeLineItem', 'li')
            .leftJoinAndSelect('er.auditor', 'auditor');
        if (manager) {
            query.andWhere('er.managerId = :managerId', { managerId: manager.id });
        }
        if (status) {
            query.andWhere('er.status = :status', { status });
        }
        return query.getMany();
    }
    async approve(exId, dto, manager) {
        const exception = await this.exceptionRepo.findOne({
            where: { id: exId },
            relations: ['auditScopeLineItem', 'auditor'],
        });
        if (!exception) {
            throw new common_1.NotFoundException('Exception request not found');
        }
        if (exception.status !== exception_request_entity_1.ExceptionStatus.PENDING) {
            throw new common_1.UnprocessableEntityException(`Status cannot be changed from ${exception.status}`);
        }
        await this.dataSource.transaction(async (managerEm) => {
            exception.status = exception_request_entity_1.ExceptionStatus.APPROVED;
            exception.managerComment = dto.managerComment;
            exception.resolvedAt = new Date();
            await managerEm.save(exception);
            const lineItem = exception.auditScopeLineItem;
            lineItem.status = audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED;
            await managerEm.save(lineItem);
            await this.notificationsService.create({
                userId: exception.auditorId,
                type: notification_entity_1.NotificationType.EXCEPTION_APPROVED,
                title: 'Exception Approved',
                message: `Your exception request for line item "${lineItem.name}" has been approved.`,
                relatedEntityType: 'ExceptionRequest',
                relatedEntityId: exception.id,
                metadata: { auditId: lineItem.auditId },
            });
            await this.auditTrailService.log({
                actorId: manager.id,
                actorRole: manager.role,
                action: audit_trail_service_1.AuditAction.EXCEPTION_APPROVED,
                entityType: 'ExceptionRequest',
                entityId: exception.id,
                metadata: { auditId: lineItem.auditId, lineItemId: lineItem.id },
            });
        });
        return { message: 'Exception approved successfully' };
    }
    async reject(exId, dto, manager) {
        const exception = await this.exceptionRepo.findOne({
            where: { id: exId },
            relations: ['auditScopeLineItem', 'auditor'],
        });
        if (!exception) {
            throw new common_1.NotFoundException('Exception request not found');
        }
        if (exception.status !== exception_request_entity_1.ExceptionStatus.PENDING) {
            throw new common_1.UnprocessableEntityException(`Status cannot be changed from ${exception.status}`);
        }
        await this.dataSource.transaction(async (managerEm) => {
            exception.status = exception_request_entity_1.ExceptionStatus.REJECTED;
            exception.managerComment = dto.managerComment;
            exception.resolvedAt = new Date();
            await managerEm.save(exception);
            const lineItem = exception.auditScopeLineItem;
            lineItem.status = audit_scope_line_item_entity_1.LineItemStatus.RETURNED;
            await managerEm.save(lineItem);
            await this.notificationsService.create({
                userId: exception.auditorId,
                type: notification_entity_1.NotificationType.EXCEPTION_REJECTED,
                title: 'Exception Rejected',
                message: `Your exception request for line item "${lineItem.name}" has been rejected. Manager comment: ${dto.managerComment}`,
                relatedEntityType: 'ExceptionRequest',
                relatedEntityId: exception.id,
                metadata: { auditId: lineItem.auditId },
            });
            await this.auditTrailService.log({
                actorId: manager.id,
                actorRole: manager.role,
                action: audit_trail_service_1.AuditAction.EXCEPTION_REJECTED,
                entityType: 'ExceptionRequest',
                entityId: exception.id,
                metadata: { auditId: lineItem.auditId, lineItemId: lineItem.id },
            });
        });
        return { message: 'Exception rejected successfully' };
    }
};
exports.ManagerExceptionsService = ManagerExceptionsService;
exports.ManagerExceptionsService = ManagerExceptionsService = ManagerExceptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exception_request_entity_1.ExceptionRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        audit_trail_service_1.AuditTrailService,
        typeorm_2.DataSource])
], ManagerExceptionsService);
//# sourceMappingURL=exceptions.service.js.map