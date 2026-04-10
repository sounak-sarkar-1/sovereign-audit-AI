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
var AdminUsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../database/entities/user.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const notification_entity_1 = require("../../database/entities/notification.entity");
let AdminUsersService = AdminUsersService_1 = class AdminUsersService {
    constructor(repository, auditRepository, assignmentRepository, auditTrailService, notificationsService) {
        this.repository = repository;
        this.auditRepository = auditRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditTrailService = auditTrailService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(AdminUsersService_1.name);
    }
    async create(createDto, actor) {
        const existingUser = await this.repository.findOne({ where: { email: createDto.email } });
        if (existingUser) {
            throw new common_1.ConflictException(`User with email "${createDto.email}" already exists`);
        }
        const passwordHash = await bcrypt.hash(createDto.defaultPassword || 'TemporaryPassword123!', 12);
        const user = this.repository.create({
            ...createDto,
            passwordHash,
            isFirstLogin: true,
            status: user_entity_1.UserStatus.ACTIVE,
        });
        const savedUser = await this.repository.save(user);
        await this.auditTrailService.log({
            actorId: actor?.id,
            actorRole: actor?.role,
            action: audit_trail_service_1.AuditAction.USER_CREATED,
            entityType: 'users',
            entityId: savedUser.id,
            metadata: { email: savedUser.email, role: savedUser.role },
            ipAddress: actor?.ip,
        });
        await this.notificationsService.create({
            userId: savedUser.id,
            type: notification_entity_1.NotificationType.USER_CREATED,
            title: 'Welcome to Sovereign Audit AI',
            message: 'Your account has been created. Please log in and change your password.',
        });
        return savedUser;
    }
    async findByEmail(email) {
        return await this.repository.findOne({ where: { email } });
    }
    async findAll(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const baseWhere = {};
        if (query.role)
            baseWhere.role = query.role;
        if (query.status)
            baseWhere.status = query.status;
        const where = query.search
            ? [
                { ...baseWhere, email: (0, typeorm_2.Like)(`%${query.search}%`) },
                { ...baseWhere, fullName: (0, typeorm_2.Like)(`%${query.search}%`) },
            ]
            : baseWhere;
        const [items, total] = await this.repository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
        });
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
    async findOne(id) {
        const user = await this.repository.findOne({
            where: { id },
            relations: ['auditorMappings', 'managedByMappings', 'clientMappings', 'managedClientsByMappings'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async update(id, updateDto, actor) {
        const user = await this.findOne(id);
        const oldStatus = user.status;
        Object.assign(user, updateDto);
        const updatedUser = await this.repository.save(user);
        await this.auditTrailService.log({
            actorId: actor?.id,
            actorRole: actor?.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'users',
            entityId: updatedUser.id,
            metadata: {
                updates: updateDto,
                statusChanged: oldStatus !== updatedUser.status
            },
            ipAddress: actor?.ip,
        });
        return updatedUser;
    }
    async remove(id, forceDelete = false, actor) {
        const user = await this.findOne(id);
        if (!forceDelete) {
            const assignmentsCount = await this.checkActiveAssignments(user);
            if (assignmentsCount > 0) {
                throw new common_1.ConflictException({
                    message: 'User has active audit assignments',
                    assignmentCount: assignmentsCount
                });
            }
        }
        await this.repository.softRemove(user);
        await this.auditTrailService.log({
            actorId: actor?.id,
            actorRole: actor?.role,
            action: audit_trail_service_1.AuditAction.USER_DELETED,
            entityType: 'users',
            entityId: user.id,
            metadata: { email: user.email, forceDelete },
            ipAddress: actor?.ip,
        });
    }
    async checkActiveAssignments(user) {
        let count = 0;
        if (user.role === user_entity_1.UserRole.AUDITOR) {
            count = await this.assignmentRepository.count({
                where: { auditorId: user.id, audit: { status: audit_entity_1.AuditStatus.IN_PROGRESS } }
            });
        }
        else if (user.role === user_entity_1.UserRole.MANAGER) {
            count = await this.auditRepository.count({
                where: { managerId: user.id, status: audit_entity_1.AuditStatus.IN_PROGRESS }
            });
        }
        else if (user.role === user_entity_1.UserRole.CLIENT) {
            count = await this.auditRepository.count({
                where: { clientId: user.id, status: audit_entity_1.AuditStatus.IN_PROGRESS }
            });
        }
        return count;
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = AdminUsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_entity_1.Audit)),
    __param(2, (0, typeorm_1.InjectRepository)(auditor_audit_assignment_entity_1.AuditorAuditAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_trail_service_1.AuditTrailService,
        notifications_service_1.NotificationsService])
], AdminUsersService);
//# sourceMappingURL=users.service.js.map