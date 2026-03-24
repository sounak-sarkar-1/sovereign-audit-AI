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
var AuditorAuditsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorAuditsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
let AuditorAuditsService = AuditorAuditsService_1 = class AuditorAuditsService {
    constructor(assignmentRepo, auditRepo, lineItemRepo, auditBURepo) {
        this.assignmentRepo = assignmentRepo;
        this.auditRepo = auditRepo;
        this.lineItemRepo = lineItemRepo;
        this.auditBURepo = auditBURepo;
        this.logger = new common_1.Logger(AuditorAuditsService_1.name);
    }
    async findAll(user) {
        const assignments = await this.assignmentRepo.find({
            where: { auditorId: user.id },
            relations: ['audit', 'audit.client'],
        });
        const auditIds = [...new Set(assignments.map(a => a.auditId))];
        if (auditIds.length === 0)
            return [];
        const audits = await this.auditRepo.find({
            where: { id: (0, typeorm_2.In)(auditIds) },
            relations: ['client'],
        });
        const results = await Promise.all(audits.map(async (audit) => {
            const totalItems = await this.lineItemRepo.count({
                where: { auditId: audit.id, assignments: { auditorId: user.id } },
            });
            const completedItems = await this.lineItemRepo.count({
                where: {
                    auditId: audit.id,
                    assignments: { auditorId: user.id },
                    status: (0, typeorm_2.In)([audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED, audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED])
                },
            });
            return {
                ...audit,
                completionStats: {
                    total: totalItems,
                    completed: completedItems,
                    percent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
                }
            };
        }));
        return results;
    }
    async findOne(auditId, user) {
        const audit = await this.auditRepo.findOne({
            where: { id: auditId },
            relations: ['client'],
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        const bus = await this.auditBURepo.find({
            where: { auditId },
            relations: ['businessUnit'],
        });
        const buStats = await Promise.all(bus.map(async (bu) => {
            const totalItems = await this.lineItemRepo.count({
                where: { auditBusinessUnitId: bu.id },
            });
            const completedItems = await this.lineItemRepo.count({
                where: {
                    auditBusinessUnitId: bu.id,
                    status: (0, typeorm_2.In)([audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED, audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED])
                },
            });
            return {
                id: bu.id,
                name: bu.businessUnit.name,
                totalItems,
                completedItems,
                completionPercent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
            };
        }));
        return {
            ...audit,
            businessUnits: buStats,
        };
    }
};
exports.AuditorAuditsService = AuditorAuditsService;
exports.AuditorAuditsService = AuditorAuditsService = AuditorAuditsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auditor_audit_assignment_entity_1.AuditorAuditAssignment)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuditorAuditsService);
//# sourceMappingURL=audits.service.js.map