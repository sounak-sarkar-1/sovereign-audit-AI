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
var ManagerAssignmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const auditor_line_item_assignment_entity_1 = require("../../database/entities/auditor-line-item-assignment.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let ManagerAssignmentsService = ManagerAssignmentsService_1 = class ManagerAssignmentsService {
    constructor(buAssignmentRepo, liAssignmentRepo, auditRepo, abuRepo, scopeRepo, mappingRepo, auditTrailService, notificationsService, dataSource) {
        this.buAssignmentRepo = buAssignmentRepo;
        this.liAssignmentRepo = liAssignmentRepo;
        this.auditRepo = auditRepo;
        this.abuRepo = abuRepo;
        this.scopeRepo = scopeRepo;
        this.mappingRepo = mappingRepo;
        this.auditTrailService = auditTrailService;
        this.notificationsService = notificationsService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ManagerAssignmentsService_1.name);
    }
    async getAuditBuName(abuId) {
        const abu = await this.abuRepo.findOne({
            where: { id: abuId },
            relations: ['businessUnit'],
        });
        return abu?.businessUnit?.name || 'Unknown BU';
    }
    async getAssignments(auditId) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        const bus = await this.abuRepo.find({
            where: { auditId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['businessUnit'],
        });
        const buAssignments = await this.buAssignmentRepo.find({
            where: { auditId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditor'],
        });
        const lineItems = await this.scopeRepo.find({
            where: { auditId, deletedAt: (0, typeorm_2.IsNull)() },
            order: { displayOrder: 'ASC' },
            relations: ['auditBusinessUnit', 'auditBusinessUnit.businessUnit'],
        });
        const liAssignments = await this.liAssignmentRepo.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditor', 'auditScopeLineItem'],
        });
        const filteredLiAssignments = liAssignments.filter(la => la.auditScopeLineItem?.auditId === auditId);
        const auditors = Array.from(new Map(buAssignments.map(a => [a.auditorId, a.auditor])).values());
        const availableAuditors = await this.mappingRepo.find({
            where: { managerId: audit.managerId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditor'],
        });
        return {
            audit,
            businessUnits: bus,
            buAssignments,
            auditors,
            availableAuditors: availableAuditors.map(m => m.auditor),
            lineItems: lineItems.map(li => ({
                ...li,
                assignment: filteredLiAssignments.find(la => la.auditScopeLineItemId === li.id),
            })),
            lineItemAssignments: filteredLiAssignments,
        };
    }
    async assignToBU(auditId, dto, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId, managerId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT && audit.status !== audit_entity_1.AuditStatus.REOPENED) {
            throw new common_1.UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
        }
        const mapping = await this.mappingRepo.findOne({
            where: { managerId, auditorId: dto.auditorId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!mapping)
            throw new common_1.UnprocessableEntityException('Auditor is not mapped to this manager');
        const abu = await this.abuRepo.findOne({
            where: { id: dto.auditBusinessUnitId, auditId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!abu)
            throw new common_1.UnprocessableEntityException('Business Unit does not belong to this audit');
        const existing = await this.buAssignmentRepo.findOne({
            where: { auditBusinessUnitId: dto.auditBusinessUnitId, auditorId: dto.auditorId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (existing)
            return existing;
        const assignment = this.buAssignmentRepo.create({
            auditId,
            auditorId: dto.auditorId,
            auditBusinessUnitId: dto.auditBusinessUnitId,
        });
        const saved = await this.buAssignmentRepo.save(assignment);
        await this.auditTrailService.log({
            actorId: managerId,
            action: audit_trail_service_1.AuditAction.AUDITOR_ASSIGNED,
            entityType: 'AuditorAuditAssignment',
            entityId: saved.id,
            metadata: { auditId, auditorId: dto.auditorId, abuId: dto.auditBusinessUnitId },
        });
        await this.notificationsService.create({
            userId: dto.auditorId,
            type: notification_entity_1.NotificationType.AUDIT_ASSIGNED,
            title: 'You have been assigned to an audit',
            message: `You have been assigned to audit "${audit.name}" for ${await this.getAuditBuName(dto.auditBusinessUnitId)}`,
            relatedEntityType: 'AuditorAuditAssignment',
            relatedEntityId: saved.id,
            metadata: { auditId },
        });
        return saved;
    }
    async unassignFromBU(auditId, assignmentId, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId, managerId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT && audit.status !== audit_entity_1.AuditStatus.REOPENED) {
            throw new common_1.UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
        }
        const assignment = await this.buAssignmentRepo.findOne({
            where: { id: assignmentId, auditId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        await this.buAssignmentRepo.softRemove(assignment);
    }
    async assignToLineItem(auditId, dto, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId, managerId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT && audit.status !== audit_entity_1.AuditStatus.REOPENED) {
            throw new common_1.UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
        }
        const li = await this.scopeRepo.findOne({
            where: { id: dto.lineItemId, auditId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!li)
            throw new common_1.UnprocessableEntityException('Line item does not belong to this audit');
        const existing = await this.liAssignmentRepo.findOne({
            where: { auditScopeLineItemId: dto.lineItemId, auditorId: dto.auditorId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (existing)
            return existing;
        await this.liAssignmentRepo.softRemove({ auditScopeLineItemId: dto.lineItemId });
        const assignment = this.liAssignmentRepo.create({
            auditScopeLineItemId: dto.lineItemId,
            auditorId: dto.auditorId,
        });
        return await this.liAssignmentRepo.save(assignment);
    }
    async unassignFromLineItem(auditId, assignmentId, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId, managerId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT && audit.status !== audit_entity_1.AuditStatus.REOPENED) {
            throw new common_1.UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
        }
        const assignment = await this.liAssignmentRepo.findOne({
            where: { id: assignmentId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditScopeLineItem'],
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        if (assignment.auditScopeLineItem?.auditId !== auditId)
            throw new common_1.UnprocessableEntityException('Assignment does not belong to this audit');
        await this.liAssignmentRepo.softRemove(assignment);
    }
};
exports.ManagerAssignmentsService = ManagerAssignmentsService;
exports.ManagerAssignmentsService = ManagerAssignmentsService = ManagerAssignmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auditor_audit_assignment_entity_1.AuditorAuditAssignment)),
    __param(1, (0, typeorm_1.InjectRepository)(auditor_line_item_assignment_entity_1.AuditorLineItemAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __param(4, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(5, (0, typeorm_1.InjectRepository)(manager_auditor_mapping_entity_1.ManagerAuditorMapping)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_trail_service_1.AuditTrailService,
        notifications_service_1.NotificationsService,
        typeorm_2.DataSource])
], ManagerAssignmentsService);
//# sourceMappingURL=assignments.service.js.map