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
var AdminBusinessUnitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBusinessUnitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_unit_entity_1 = require("../../database/entities/business-unit.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let AdminBusinessUnitsService = AdminBusinessUnitsService_1 = class AdminBusinessUnitsService {
    constructor(repository, auditRepository, auditTrailService) {
        this.repository = repository;
        this.auditRepository = auditRepository;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(AdminBusinessUnitsService_1.name);
    }
    async create(clientId, createDto, actor) {
        const unit = this.repository.create({
            ...createDto,
            clientId,
        });
        const savedUnit = await this.repository.save(unit);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'client_business_units',
            entityId: savedUnit.id,
            metadata: { clientId, ...createDto },
            ipAddress: actor.ip,
        });
        return savedUnit;
    }
    async findAllByClient(clientId) {
        return await this.repository.find({
            where: { clientId },
            order: { name: 'ASC' },
        });
    }
    async findOne(clientId, id) {
        const unit = await this.repository.findOne({ where: { id, clientId } });
        if (!unit) {
            throw new common_1.NotFoundException(`Business Unit with ID "${id}" not found for this client`);
        }
        return unit;
    }
    async update(clientId, id, updateDto, actor) {
        const unit = await this.findOne(clientId, id);
        Object.assign(unit, updateDto);
        const updatedUnit = await this.repository.save(unit);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'client_business_units',
            entityId: updatedUnit.id,
            metadata: { clientId, ...updateDto },
            ipAddress: actor.ip,
        });
        return updatedUnit;
    }
    async remove(clientId, id, actor) {
        const unit = await this.findOne(clientId, id);
        const activeAuditsCount = await this.auditRepository.createQueryBuilder('audit')
            .innerJoin('audit_business_units', 'abu', 'abu.audit_id = audit.id')
            .where('abu.business_unit_id = :buId', { buId: id })
            .andWhere('audit.status NOT IN (:...statuses)', { statuses: [audit_entity_1.AuditStatus.CLOSED, audit_entity_1.AuditStatus.DELETED] })
            .getCount();
        if (activeAuditsCount > 0) {
            throw new common_1.UnprocessableEntityException({
                code: 'BUSINESS_RULE_ERROR',
                message: 'Cannot delete Business Unit as it is part of an active audit',
                activeAuditCount: activeAuditsCount,
            });
        }
        await this.repository.softRemove(unit);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'client_business_units',
            entityId: unit.id,
            metadata: { clientId, id },
            ipAddress: actor.ip,
        });
    }
};
exports.AdminBusinessUnitsService = AdminBusinessUnitsService;
exports.AdminBusinessUnitsService = AdminBusinessUnitsService = AdminBusinessUnitsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_unit_entity_1.BusinessUnit)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_trail_service_1.AuditTrailService])
], AdminBusinessUnitsService);
//# sourceMappingURL=business-units.service.js.map