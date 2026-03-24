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
var AdminAuditsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
let AdminAuditsService = AdminAuditsService_1 = class AdminAuditsService {
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
        this.logger = new common_1.Logger(AdminAuditsService_1.name);
    }
    async findAll(filters) {
        const query = this.auditRepository.createQueryBuilder('audit')
            .leftJoinAndSelect('audit.client', 'client')
            .leftJoinAndSelect('audit.manager', 'manager')
            .withDeleted();
        if (filters.search) {
            query.andWhere('audit.name ILIKE :search', { search: `%${filters.search}%` });
        }
        if (filters.status) {
            query.andWhere('audit.status = :status', { status: filters.status });
        }
        if (filters.clientId) {
            query.andWhere('audit.clientId = :clientId', { clientId: filters.clientId });
        }
        if (filters.managerId) {
            query.andWhere('audit.managerId = :managerId', { managerId: filters.managerId });
        }
        if (filters.startDate) {
            query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
        }
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'DESC';
        query.orderBy(`audit.${sortBy}`, sortOrder);
        return await query.getMany();
    }
    async exportCsv(filters) {
        const audits = await this.findAll(filters);
        const headers = [
            'Audit ID',
            'Name',
            'Client',
            'Manager',
            'Status',
            'Start Date',
            'Expected Completion',
            'Created At',
            'Deleted At'
        ];
        const rows = audits.map(audit => [
            audit.id,
            audit.name,
            audit.client?.fullName || 'N/A',
            audit.manager?.fullName || 'N/A',
            audit.status,
            audit.startDate ? new Date(audit.startDate).toISOString() : 'N/A',
            audit.expectedCompletionDate ? new Date(audit.expectedCompletionDate).toISOString() : 'N/A',
            new Date(audit.createdAt).toISOString(),
            audit.deletedAt ? new Date(audit.deletedAt).toISOString() : 'N/A'
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        return csvContent;
    }
};
exports.AdminAuditsService = AdminAuditsService;
exports.AdminAuditsService = AdminAuditsService = AdminAuditsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminAuditsService);
//# sourceMappingURL=audits.service.js.map