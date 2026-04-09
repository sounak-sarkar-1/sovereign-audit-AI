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
var ClientInsightsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInsightsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
let ClientInsightsService = ClientInsightsService_1 = class ClientInsightsService {
    constructor(auditRepo, lineItemRepo, exceptionRepo) {
        this.auditRepo = auditRepo;
        this.lineItemRepo = lineItemRepo;
        this.exceptionRepo = exceptionRepo;
        this.logger = new common_1.Logger(ClientInsightsService_1.name);
    }
    async getGlobalInsights(clientId) {
        const audits = await this.auditRepo.find({
            where: { clientId, status: audit_entity_1.AuditStatus.CLOSED },
            order: { expectedCompletionDate: 'ASC' },
            relations: ['manager'],
        });
        if (audits.length === 0) {
            return { data: { auditsCount: 0, complianceTrend: [], riskByBu: [], recurringFindings: [] } };
        }
        const complianceTrend = audits.map(audit => ({
            auditId: audit.id,
            name: audit.name,
            date: audit.expectedCompletionDate,
            score: 100,
        }));
        const riskByBu = await this.lineItemRepo.createQueryBuilder('li')
            .leftJoin('li.audit', 'audit')
            .leftJoin('li.auditBusinessUnit', 'bu')
            .select('bu.name', 'buName')
            .addSelect('COUNT(li.id)', 'totalItems')
            .addSelect('SUM(CASE WHEN li.status = :exApproved THEN 1 ELSE 0 END)', 'exceptionCount')
            .where('audit.clientId = :clientId', { clientId })
            .andWhere('audit.status = :closed', { closed: audit_entity_1.AuditStatus.CLOSED })
            .setParameters({ exApproved: audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED })
            .groupBy('bu.name')
            .getRawMany();
        return {
            data: {
                auditsCount: audits.length,
                complianceTrend,
                riskByBu: riskByBu.map(r => ({
                    buName: r.buName,
                    rate: r.totalItems > 0 ? (r.exceptionCount / r.totalItems) * 100 : 0,
                })),
                recurringFindings: [],
            }
        };
    }
};
exports.ClientInsightsService = ClientInsightsService;
exports.ClientInsightsService = ClientInsightsService = ClientInsightsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(2, (0, typeorm_1.InjectRepository)(exception_request_entity_1.ExceptionRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClientInsightsService);
//# sourceMappingURL=insights.service.js.map