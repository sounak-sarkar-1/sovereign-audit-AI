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
var ClientAuditsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAuditsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
let ClientAuditsService = ClientAuditsService_1 = class ClientAuditsService {
    constructor(auditRepo, scopeRepo, abuRepo) {
        this.auditRepo = auditRepo;
        this.scopeRepo = scopeRepo;
        this.abuRepo = abuRepo;
        this.logger = new common_1.Logger(ClientAuditsService_1.name);
    }
    async getProgress(id, clientId) {
        const audit = await this.auditRepo.findOne({
            where: { id, clientId },
        });
        if (!audit || audit.status === audit_entity_1.AuditStatus.DRAFT) {
            throw new common_1.NotFoundException('Audit not found');
        }
        const scopeItems = await this.scopeRepo.find({
            where: { auditId: id },
            relations: ['auditBusinessUnit', 'auditBusinessUnit.businessUnit'],
        });
        const totalItems = scopeItems.length;
        const submittedItems = scopeItems.filter(i => i.status === audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED || i.status === audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED).length;
        const draftItems = scopeItems.filter(i => i.status === audit_scope_line_item_entity_1.LineItemStatus.DRAFT_SAVED).length;
        const pendingExceptions = scopeItems.filter(i => i.status === audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_PENDING).length;
        const completionPercent = totalItems > 0 ? Math.round((submittedItems / totalItems) * 100) : 0;
        const buMap = new Map();
        const abus = await this.abuRepo.find({
            where: { auditId: id },
            relations: ['businessUnit'],
        });
        abus.forEach(abu => {
            buMap.set(abu.id, {
                name: abu.businessUnit?.name || 'Unknown',
                total: 0,
                submitted: 0,
            });
        });
        scopeItems.forEach(item => {
            const buStats = buMap.get(item.auditBusinessUnitId);
            if (buStats) {
                buStats.total++;
                if (item.status === audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED || item.status === audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED) {
                    buStats.submitted++;
                }
            }
        });
        const businessUnits = Array.from(buMap.values()).map(bu => ({
            name: bu.name,
            completionPercent: bu.total > 0 ? Math.round((bu.submitted / bu.total) * 100) : 0,
        }));
        return {
            totalItems,
            submittedItems,
            draftItems,
            pendingExceptions,
            completionPercent,
            businessUnits,
        };
    }
    async findAll(clientId, page = 1, limit = 10, status) {
        const query = this.auditRepo.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.manager', 'manager')
            .where('audit.clientId = :clientId', { clientId })
            .andWhere('audit.status != :status', { status: audit_entity_1.AuditStatus.DRAFT });
        if (status) {
            query.andWhere('audit.status = :status', { status });
        }
        const [items, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('audit.createdAt', 'DESC')
            .getManyAndCount();
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
    async findOne(id, clientId) {
        const audit = await this.auditRepo.findOne({
            where: { id, clientId },
            relations: ['manager'],
        });
        if (!audit || audit.status === audit_entity_1.AuditStatus.DRAFT) {
            throw new common_1.NotFoundException('Audit not found');
        }
        return { data: audit };
    }
};
exports.ClientAuditsService = ClientAuditsService;
exports.ClientAuditsService = ClientAuditsService = ClientAuditsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClientAuditsService);
//# sourceMappingURL=audits.service.js.map