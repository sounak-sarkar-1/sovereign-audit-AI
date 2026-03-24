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
var ManagerAuditsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAuditsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const manager_client_mapping_entity_1 = require("../../database/entities/manager-client-mapping.entity");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const business_unit_entity_1 = require("../../database/entities/business-unit.entity");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let ManagerAuditsService = ManagerAuditsService_1 = class ManagerAuditsService {
    constructor(auditRepo, auditBuRepo, managerClientRepo, userRepo, assignmentRepo, buRepo, requestRepo, dataSource, auditTrailService) {
        this.auditRepo = auditRepo;
        this.auditBuRepo = auditBuRepo;
        this.managerClientRepo = managerClientRepo;
        this.userRepo = userRepo;
        this.assignmentRepo = assignmentRepo;
        this.buRepo = buRepo;
        this.requestRepo = requestRepo;
        this.dataSource = dataSource;
        this.auditTrailService = auditTrailService;
        this.logger = new common_1.Logger(ManagerAuditsService_1.name);
    }
    async findAll(managerId, page = 1, limit = 10, status) {
        const query = this.auditRepo.createQueryBuilder('audit')
            .where('audit.manager_id = :managerId', { managerId })
            .andWhere('audit.deleted_at IS NULL');
        if (status) {
            query.andWhere('audit.status = :status', { status });
        }
        const [audits, total] = await query
            .leftJoinAndSelect('audit.client', 'client')
            .orderBy('audit.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const auditsWithStats = await Promise.all(audits.map(async (audit) => {
            const auditorCount = await this.assignmentRepo
                .createQueryBuilder('assignment')
                .where('assignment.audit_id = :auditId', { auditId: audit.id })
                .andWhere('assignment.deleted_at IS NULL')
                .select('COUNT(DISTINCT assignment.auditor_id)', 'count')
                .getRawOne();
            const completionPercentage = 0;
            const openExceptionsCount = 0;
            const pendingRequest = await this.requestRepo.findOne({
                where: { auditId: audit.id, status: exceptional_action_request_entity_1.ExceptionalRequestStatus.PENDING },
            });
            return {
                ...audit,
                auditorCount: parseInt(auditorCount.count),
                completionPercentage,
                openExceptionsCount,
                hasPendingExceptionalRequest: !!pendingRequest,
            };
        }));
        return {
            items: auditsWithStats,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getClients(managerId) {
        const mappings = await this.managerClientRepo.find({
            where: { managerId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['client'],
        });
        return mappings.map(m => m.client);
    }
    async create(createDto, managerId) {
        const mapping = await this.managerClientRepo.findOne({
            where: { managerId, clientId: createDto.clientId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!mapping) {
            throw new common_1.BadRequestException('Client is not mapped to this manager');
        }
        const now = new Date();
        const startDate = new Date(createDto.startDate);
        const expectedEndDate = new Date(createDto.expectedCompletionDate);
        if (startDate < new Date(now.setHours(0, 0, 0, 0))) {
            throw new common_1.BadRequestException('Start date cannot be in the past');
        }
        if (expectedEndDate <= startDate) {
            throw new common_1.BadRequestException('Expected completion date must be after start date');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const audit = this.auditRepo.create({
                ...createDto,
                managerId,
                status: audit_entity_1.AuditStatus.DRAFT,
            });
            const savedAudit = await queryRunner.manager.save(audit);
            const auditBUs = createDto.businessUnitIds.map(buId => queryRunner.manager.create(audit_business_unit_entity_1.AuditBusinessUnit, {
                auditId: savedAudit.id,
                businessUnitId: buId,
            }));
            await queryRunner.manager.save(auditBUs);
            await queryRunner.commitTransaction();
            await this.auditTrailService.log({
                actorId: managerId,
                action: audit_trail_service_1.AuditAction.AUDIT_CREATED,
                entityType: 'Audit',
                entityId: savedAudit.id,
                metadata: { name: savedAudit.name },
            });
            return this.findOne(savedAudit.id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create audit: ${err.message}`, err.stack);
            throw new common_1.InternalServerErrorException('Failed to create audit');
        }
        finally {
            await queryRunner.release();
        }
    }
    async findOne(id) {
        const audit = await this.auditRepo.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['client', 'manager'],
        });
        if (!audit) {
            throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
        }
        const auditBUs = await this.auditBuRepo.find({
            where: { auditId: id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['businessUnit'],
        });
        const assignments = await this.assignmentRepo.find({
            where: { auditId: id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['auditor'],
        });
        return {
            ...audit,
            businessUnits: auditBUs.map(abu => abu.businessUnit),
            assignments,
        };
    }
    async update(id, updateDto, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id, managerId, deletedAt: (0, typeorm_2.IsNull)() }
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT && audit.status !== audit_entity_1.AuditStatus.REOPENED) {
        }
        if (updateDto.name)
            audit.name = updateDto.name;
        if (updateDto.description !== undefined)
            audit.description = updateDto.description;
        if (updateDto.expectedCompletionDate) {
            const newEndDate = new Date(updateDto.expectedCompletionDate);
            if (newEndDate <= audit.startDate) {
                throw new common_1.BadRequestException('Expected completion date must be after start date');
            }
            audit.expectedCompletionDate = newEndDate;
        }
        await this.auditRepo.save(audit);
        await this.auditTrailService.log({
            actorId: managerId,
            action: audit_trail_service_1.AuditAction.AUDIT_STARTED,
            entityType: 'Audit',
            entityId: id,
            metadata: updateDto,
        });
        return this.findOne(id);
    }
    async start(id, managerId) {
        const audit = await this.auditRepo.findOne({
            where: { id, managerId, deletedAt: (0, typeorm_2.IsNull)() }
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit not found');
        if (audit.status !== audit_entity_1.AuditStatus.DRAFT)
            throw new common_1.BadRequestException('Only draft audits can be started');
        const scopeItemCount = await this.dataSource.query(`SELECT COUNT(*) FROM audit_scope_line_items WHERE audit_id = $1 AND deleted_at IS NULL`, [id]);
        if (parseInt(scopeItemCount[0].count) === 0) {
            throw new common_1.BadRequestException('Cannot start audit without scope line items');
        }
        const auditorAssignmentCount = await this.assignmentRepo.count({
            where: { auditId: id, deletedAt: (0, typeorm_2.IsNull)() }
        });
        if (auditorAssignmentCount === 0) {
            throw new common_1.BadRequestException('Cannot start audit without assigned auditors');
        }
        audit.status = audit_entity_1.AuditStatus.IN_PROGRESS;
        await this.auditRepo.save(audit);
        await this.auditTrailService.log({
            actorId: managerId,
            action: audit_trail_service_1.AuditAction.AUDIT_STARTED,
            entityType: 'Audit',
            entityId: id,
        });
        return this.findOne(id);
    }
};
exports.ManagerAuditsService = ManagerAuditsService;
exports.ManagerAuditsService = ManagerAuditsService = ManagerAuditsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __param(2, (0, typeorm_1.InjectRepository)(manager_client_mapping_entity_1.ManagerClientMapping)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(auditor_audit_assignment_entity_1.AuditorAuditAssignment)),
    __param(5, (0, typeorm_1.InjectRepository)(business_unit_entity_1.BusinessUnit)),
    __param(6, (0, typeorm_1.InjectRepository)(exceptional_action_request_entity_1.ExceptionalActionRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        audit_trail_service_1.AuditTrailService])
], ManagerAuditsService);
//# sourceMappingURL=audits.service.js.map