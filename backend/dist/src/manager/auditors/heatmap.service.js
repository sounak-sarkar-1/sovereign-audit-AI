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
var HeatmapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
let HeatmapService = HeatmapService_1 = class HeatmapService {
    constructor(userRepo, mappingRepo, buAssignmentRepo, scopeRepo, auditRepo) {
        this.userRepo = userRepo;
        this.mappingRepo = mappingRepo;
        this.buAssignmentRepo = buAssignmentRepo;
        this.scopeRepo = scopeRepo;
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(HeatmapService_1.name);
    }
    async getHeatmap(managerId, auditId) {
        const mappings = await this.mappingRepo.find({
            where: { managerId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditor'],
        });
        const auditors = mappings.map(m => m.auditor);
        const auditorIds = auditors.map(a => a.id);
        if (auditorIds.length === 0) {
            return {
                kpis: { openLineItems: 0, completionPercent: 0, activeEngagementsCount: 0 },
                auditors: [],
            };
        }
        const assignments = await this.buAssignmentRepo.find({
            where: {
                auditorId: (0, typeorm_2.In)(auditorIds),
                deletedAt: (0, typeorm_2.IsNull)(),
                ...(auditId ? { auditId } : {}),
            },
            relations: ['audit', 'auditBusinessUnit', 'auditBusinessUnit.businessUnit'],
        });
        const heatmapData = await Promise.all(auditors.map(async (auditor) => {
            const auditorAssignments = assignments.filter(a => a.auditorId === auditor.id);
            const auditDetails = await Promise.all([...new Set(auditorAssignments.map(a => a.auditId))].map(async (aId) => {
                const audit = auditorAssignments.find(a => a.auditId === aId).audit;
                const bus = auditorAssignments.filter(a => a.auditId === aId).map(a => ({
                    id: a.auditBusinessUnitId,
                    name: a.auditBusinessUnit.businessUnit.name
                }));
                const buIds = bus.map(b => b.id);
                const lineItems = await this.scopeRepo.find({
                    where: { auditBusinessUnitId: (0, typeorm_2.In)(buIds), deletedAt: (0, typeorm_2.IsNull)() }
                });
                const openItems = lineItems.filter(li => li.status !== audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED && li.status !== audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED).length;
                const totalItems = lineItems.length;
                return {
                    auditId: aId,
                    auditName: audit.name,
                    businessUnits: bus,
                    openItems,
                    totalItems,
                    completionPercent: totalItems > 0 ? Math.round(((totalItems - openItems) / totalItems) * 100) : 100,
                };
            }));
            const activeEngagementsCount = auditDetails.filter(ad => ad.totalItems > 0).length;
            const totalOpenItems = auditDetails.reduce((sum, ad) => sum + ad.openItems, 0);
            const totalItems = auditDetails.reduce((sum, ad) => sum + ad.totalItems, 0);
            return {
                id: auditor.id,
                fullName: auditor.fullName,
                email: auditor.email,
                activeEngagementsCount,
                openLineItems: totalOpenItems,
                completionPercent: totalItems > 0 ? Math.round(((totalItems - totalOpenItems) / totalItems) * 100) : 100,
                breakdown: auditDetails,
            };
        }));
        const totalOpen = heatmapData.reduce((sum, a) => sum + a.openLineItems, 0);
        const totalItems = heatmapData.reduce((sum, a) => sum + (a.openLineItems / (a.completionPercent / 100 || 1) || 0), 0);
        const allTotalItems = heatmapData.reduce((sum, a) => {
            const audTotal = a.breakdown.reduce((s, b) => s + b.totalItems, 0);
            return sum + audTotal;
        }, 0);
        return {
            kpis: {
                openLineItems: totalOpen,
                completionPercent: allTotalItems > 0 ? Math.round(((allTotalItems - totalOpen) / allTotalItems) * 100) : 100,
                activeEngagementsCount: [...new Set(assignments.map(a => a.auditId))].length,
            },
            auditors: heatmapData,
        };
    }
};
exports.HeatmapService = HeatmapService;
exports.HeatmapService = HeatmapService = HeatmapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(manager_auditor_mapping_entity_1.ManagerAuditorMapping)),
    __param(2, (0, typeorm_1.InjectRepository)(auditor_audit_assignment_entity_1.AuditorAuditAssignment)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(4, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HeatmapService);
//# sourceMappingURL=heatmap.service.js.map