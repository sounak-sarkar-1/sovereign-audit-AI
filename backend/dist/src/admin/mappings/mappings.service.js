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
var AdminMappingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMappingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const manager_client_mapping_entity_1 = require("../../database/entities/manager-client-mapping.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let AdminMappingsService = AdminMappingsService_1 = class AdminMappingsService {
    constructor(managerAuditorRepo, managerClientRepo, auditTrailService) {
        this.managerAuditorRepo = managerAuditorRepo;
        this.managerClientRepo = managerClientRepo;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(AdminMappingsService_1.name);
    }
    async addManagerAuditorMapping(dto, actor) {
        const existing = await this.managerAuditorRepo.findOne({
            where: { managerId: dto.managerId, auditorId: dto.targetId }
        });
        if (existing) {
            throw new common_1.ConflictException('Mapping already exists');
        }
        const mapping = this.managerAuditorRepo.create({
            managerId: dto.managerId,
            auditorId: dto.targetId
        });
        await this.managerAuditorRepo.save(mapping);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.MAPPING_CREATED,
            entityType: 'manager_auditor_mapping',
            entityId: mapping.id,
            metadata: dto,
            ipAddress: actor.ip,
        });
    }
    async removeManagerAuditorMapping(managerId, auditorId, actor) {
        const mapping = await this.managerAuditorRepo.findOne({
            where: { managerId, auditorId }
        });
        if (!mapping) {
            throw new common_1.NotFoundException('Mapping not found');
        }
        await this.managerAuditorRepo.softRemove(mapping);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.MAPPING_DELETED,
            entityType: 'manager_auditor_mapping',
            entityId: mapping.id,
            metadata: { managerId, auditorId },
            ipAddress: actor.ip,
        });
    }
    async addManagerClientMapping(dto, actor) {
        const existing = await this.managerClientRepo.findOne({
            where: { managerId: dto.managerId, clientId: dto.targetId }
        });
        if (existing) {
            throw new common_1.ConflictException('Mapping already exists');
        }
        const mapping = this.managerClientRepo.create({
            managerId: dto.managerId,
            clientId: dto.targetId
        });
        await this.managerClientRepo.save(mapping);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.MAPPING_CREATED,
            entityType: 'manager_client_mapping',
            entityId: mapping.id,
            metadata: dto,
            ipAddress: actor.ip,
        });
    }
    async removeManagerClientMapping(managerId, clientId, actor) {
        const mapping = await this.managerClientRepo.findOne({
            where: { managerId, clientId }
        });
        if (!mapping) {
            throw new common_1.NotFoundException('Mapping not found');
        }
        await this.managerClientRepo.softRemove(mapping);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.MAPPING_DELETED,
            entityType: 'manager_client_mapping',
            entityId: mapping.id,
            metadata: { managerId, clientId },
            ipAddress: actor.ip,
        });
    }
};
exports.AdminMappingsService = AdminMappingsService;
exports.AdminMappingsService = AdminMappingsService = AdminMappingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manager_auditor_mapping_entity_1.ManagerAuditorMapping)),
    __param(1, (0, typeorm_1.InjectRepository)(manager_client_mapping_entity_1.ManagerClientMapping)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_trail_service_1.AuditTrailService])
], AdminMappingsService);
//# sourceMappingURL=mappings.service.js.map