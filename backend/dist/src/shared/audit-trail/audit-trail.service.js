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
var AuditTrailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailService = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_trail_log_entity_1 = require("../../database/entities/audit-trail-log.entity");
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_CREATED"] = "USER_CREATED";
    AuditAction["USER_UPDATED"] = "USER_UPDATED";
    AuditAction["USER_DELETED"] = "USER_DELETED";
    AuditAction["AUDIT_CREATED"] = "AUDIT_CREATED";
    AuditAction["AUDIT_UPDATED"] = "AUDIT_UPDATED";
    AuditAction["AUDIT_STARTED"] = "AUDIT_STARTED";
    AuditAction["SCOPE_DEFINED"] = "SCOPE_DEFINED";
    AuditAction["AUDITOR_ASSIGNED"] = "AUDITOR_ASSIGNED";
    AuditAction["RESPONSE_SUBMITTED"] = "RESPONSE_SUBMITTED";
    AuditAction["EXCEPTION_RAISED"] = "EXCEPTION_RAISED";
    AuditAction["EXCEPTION_APPROVED"] = "EXCEPTION_APPROVED";
    AuditAction["EXCEPTION_REJECTED"] = "EXCEPTION_REJECTED";
    AuditAction["REPORT_GENERATED"] = "REPORT_GENERATED";
    AuditAction["REPORT_SENT_TO_CLIENT"] = "REPORT_SENT_TO_CLIENT";
    AuditAction["CLIENT_FEEDBACK_SUBMITTED"] = "CLIENT_FEEDBACK_SUBMITTED";
    AuditAction["AUDIT_CLOSED"] = "AUDIT_CLOSED";
    AuditAction["AUDIT_DELETED"] = "AUDIT_DELETED";
    AuditAction["AUDIT_REOPENED"] = "AUDIT_REOPENED";
    AuditAction["AUDIT_ARCHIVED"] = "AUDIT_ARCHIVED";
    AuditAction["EXCEPTIONAL_REQUEST_RAISED"] = "EXCEPTIONAL_REQUEST_RAISED";
    AuditAction["EXCEPTIONAL_REQUEST_APPROVED"] = "EXCEPTIONAL_REQUEST_APPROVED";
    AuditAction["EXCEPTIONAL_REQUEST_REJECTED"] = "EXCEPTIONAL_REQUEST_REJECTED";
    AuditAction["MAPPING_CREATED"] = "MAPPING_CREATED";
    AuditAction["MAPPING_DELETED"] = "MAPPING_DELETED";
    AuditAction["TEMPLATE_CREATED"] = "TEMPLATE_CREATED";
    AuditAction["TEMPLATE_UPDATED"] = "TEMPLATE_UPDATED";
    AuditAction["TEMPLATE_DELETED"] = "TEMPLATE_DELETED";
    AuditAction["CLARIFICATION_CLOSED"] = "CLARIFICATION_CLOSED";
    AuditAction["CLARIFICATION_RESPONDED"] = "CLARIFICATION_RESPONDED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
let AuditTrailService = AuditTrailService_1 = class AuditTrailService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(AuditTrailService_1.name);
    }
    async log(entry) {
        try {
            const logRecord = this.repository.create({
                actorUserId: entry.actorId,
                actorRole: entry.actorRole,
                actionType: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId,
                payload: entry.metadata,
                ipAddress: entry.ipAddress,
            });
            await this.repository.insert(logRecord);
        }
        catch (error) {
            this.logger.error(`Failed to create audit trail log: ${error.message}`, error.stack);
        }
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const qb = this.repository.createQueryBuilder('log')
            .leftJoinAndSelect('log.actorUser', 'actor')
            .orderBy('log.createdAt', 'DESC')
            .take(limit)
            .skip(skip);
        if (query.action) {
            qb.andWhere('log.actionType = :action', { action: query.action });
        }
        if (query.entityType) {
            qb.andWhere('log.entityType = :entityType', { entityType: query.entityType });
        }
        if (query.actorId) {
            qb.andWhere('log.actorUserId = :actorId', { actorId: query.actorId });
        }
        if (query.search) {
            qb.andWhere('(log.entityId ILIKE :search OR CAST(log.payload AS TEXT) ILIKE :search)', {
                search: `%${query.search}%`
            });
        }
        if (query.startDate) {
            qb.andWhere('log.createdAt >= :startDate', { startDate: query.startDate });
        }
        if (query.endDate) {
            qb.andWhere('log.createdAt <= :endDate', { endDate: query.endDate });
        }
        const [items, total] = await qb.getManyAndCount();
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findForAudit(auditId) {
        return this.repository.createQueryBuilder('log')
            .leftJoinAndSelect('log.actorUser', 'actor')
            .where('log.entityId = :auditId', { auditId })
            .orWhere("log.payload->>'auditId' = :auditId", { auditId })
            .orderBy('log.createdAt', 'DESC')
            .getMany();
    }
};
exports.AuditTrailService = AuditTrailService;
exports.AuditTrailService = AuditTrailService = AuditTrailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_trail_log_entity_1.AuditTrailLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditTrailService);
//# sourceMappingURL=audit-trail.service.js.map