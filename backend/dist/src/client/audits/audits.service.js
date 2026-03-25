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
let ClientAuditsService = ClientAuditsService_1 = class ClientAuditsService {
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(ClientAuditsService_1.name);
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientAuditsService);
//# sourceMappingURL=audits.service.js.map