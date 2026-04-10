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
var ManagerClarificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerClarificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clarification_request_entity_1 = require("../../database/entities/clarification-request.entity");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const clarification_response_entity_1 = require("../../database/entities/clarification-response.entity");
const notification_entity_1 = require("../../database/entities/notification.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let ManagerClarificationsService = ManagerClarificationsService_1 = class ManagerClarificationsService {
    constructor(clarificationRepo, exceptionRepo, responseRepo, notificationsService, auditTrailService) {
        this.clarificationRepo = clarificationRepo;
        this.exceptionRepo = exceptionRepo;
        this.responseRepo = responseRepo;
        this.notificationsService = notificationsService;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(ManagerClarificationsService_1.name);
    }
    async respond(id, message, manager) {
        const clarification = await this.clarificationRepo.findOne({
            where: { id },
            relations: ['audit']
        });
        if (!clarification)
            throw new common_1.NotFoundException('Thread not found');
        if (clarification.status === clarification_request_entity_1.ClarificationStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot reply to a closed thread');
        }
        const response = this.responseRepo.create({
            clarificationRequestId: id,
            respondedBy: manager.id,
            message,
        });
        const saved = await this.responseRepo.save(response);
        clarification.status = clarification_request_entity_1.ClarificationStatus.RESPONDED;
        await this.clarificationRepo.save(clarification);
        await this.notificationsService.create({
            userId: clarification.clientId,
            type: notification_entity_1.NotificationType.CLARIFICATION_REQUEST,
            title: 'New message on your clarification',
            message: `Manager has replied: ${message}`,
            relatedEntityType: 'ClarificationRequest',
            relatedEntityId: id,
            metadata: { auditId: clarification.auditId },
        });
        await this.auditTrailService.log({
            actorId: manager.id,
            actorRole: manager.role,
            action: audit_trail_service_1.AuditAction.CLARIFICATION_RESPONDED,
            entityType: 'ClarificationRequest',
            entityId: id,
        });
        return saved;
    }
    async findAll(status, manager) {
        const query = this.clarificationRepo.createQueryBuilder('cr')
            .leftJoinAndSelect('cr.audit', 'audit')
            .leftJoinAndSelect('cr.client', 'client')
            .leftJoinAndSelect('cr.responses', 'responses')
            .orderBy('cr.createdAt', 'DESC');
        if (manager) {
            query.andWhere('cr.managerId = :managerId', { managerId: manager.id });
        }
        if (status) {
            query.andWhere('cr.status = :status', { status });
        }
        return query.getMany();
    }
    async findOne(id) {
        const clarification = await this.clarificationRepo.findOne({
            where: { id },
            relations: ['audit', 'client', 'responses', 'responses.user', 'relatedException'],
            order: { responses: { createdAt: 'ASC' } },
        });
        if (!clarification) {
            throw new common_1.NotFoundException('Clarification thread not found');
        }
        return clarification;
    }
    async close(id, manager) {
        const clarification = await this.clarificationRepo.findOne({ where: { id } });
        if (!clarification) {
            throw new common_1.NotFoundException('Clarification thread not found');
        }
        clarification.status = clarification_request_entity_1.ClarificationStatus.CLOSED;
        await this.clarificationRepo.save(clarification);
        await this.auditTrailService.log({
            actorId: manager.id,
            actorRole: manager.role,
            action: audit_trail_service_1.AuditAction.CLARIFICATION_CLOSED,
            entityType: 'ClarificationRequest',
            entityId: clarification.id,
            metadata: { auditId: clarification.auditId },
        });
        return { message: 'Clarification thread closed' };
    }
    async create(dto, manager) {
        if (dto.relatedExceptionId) {
            const exception = await this.exceptionRepo.findOne({ where: { id: dto.relatedExceptionId } });
            if (!exception) {
                throw new common_1.BadRequestException('Related exception not found');
            }
        }
        const clarification = this.clarificationRepo.create({
            auditId: dto.auditId,
            managerId: manager.id,
            clientId: dto.clientId,
            message: dto.message,
            relatedExceptionId: dto.relatedExceptionId,
            status: clarification_request_entity_1.ClarificationStatus.PENDING,
        });
        const saved = await this.clarificationRepo.save(clarification);
        await this.notificationsService.create({
            userId: dto.clientId,
            type: notification_entity_1.NotificationType.CLARIFICATION_REQUEST,
            title: 'Clarification Requested',
            message: `A manager has requested clarification for an audit item. Message: ${dto.message}`,
            relatedEntityType: 'ClarificationRequest',
            relatedEntityId: saved.id,
            metadata: { auditId: dto.auditId },
        });
        return saved;
    }
};
exports.ManagerClarificationsService = ManagerClarificationsService;
exports.ManagerClarificationsService = ManagerClarificationsService = ManagerClarificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clarification_request_entity_1.ClarificationRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(exception_request_entity_1.ExceptionRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(clarification_response_entity_1.ClarificationResponse)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        audit_trail_service_1.AuditTrailService])
], ManagerClarificationsService);
//# sourceMappingURL=clarifications.service.js.map