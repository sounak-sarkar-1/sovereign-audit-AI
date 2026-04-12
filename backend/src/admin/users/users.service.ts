import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserRole,
  UserStatus,
} from '../../database/entities/user.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    @InjectRepository(AuditorAuditAssignment)
    private readonly assignmentRepository: Repository<AuditorAuditAssignment>,
    private readonly auditTrailService: AuditTrailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createDto: CreateUserDto,
    actor?: { id: string; role: string; ip?: string },
  ): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { email: createDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email "${createDto.email}" already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(
      createDto.defaultPassword || 'TemporaryPassword123!',
      12,
    );

    const user = this.repository.create({
      ...createDto,
      passwordHash,
      isFirstLogin: true,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.repository.save(user);

    await this.auditTrailService.log({
      actorId: actor?.id,
      actorRole: actor?.role,
      action: AuditAction.USER_CREATED,
      entityType: 'users',
      entityId: savedUser.id,
      metadata: { email: savedUser.email, role: savedUser.role },
      ipAddress: actor?.ip,
    });

    await this.notificationsService.create({
      userId: savedUser.id,
      type: NotificationType.USER_CREATED,
      title: 'Welcome to Sovereign Audit AI',
      message:
        'Your account has been created. Please log in and change your password.',
    });

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }): Promise<{ data: User[]; meta: any }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const baseWhere: FindOptionsWhere<User> = {};
    if (query.role) baseWhere.role = query.role;
    if (query.status) baseWhere.status = query.status;

    const where = query.search
      ? [
          { ...baseWhere, email: Like(`%${query.search}%`) },
          { ...baseWhere, fullName: Like(`%${query.search}%`) },
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

  async findOne(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      relations: [
        'auditorMappings',
        'managedByMappings',
        'clientMappings',
        'managedClientsByMappings',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateDto: UpdateUserDto,
    actor?: { id: string; role: string; ip?: string },
  ): Promise<User> {
    const user = await this.findOne(id);

    const oldStatus = user.status;
    Object.assign(user, updateDto);
    const updatedUser = await this.repository.save(user);

    await this.auditTrailService.log({
      actorId: actor?.id,
      actorRole: actor?.role,
      action: AuditAction.USER_UPDATED,
      entityType: 'users',
      entityId: updatedUser.id,
      metadata: {
        updates: updateDto,
        statusChanged: oldStatus !== updatedUser.status,
      },
      ipAddress: actor?.ip,
    });

    return updatedUser;
  }

  async remove(
    id: string,
    forceDelete: boolean = false,
    actor?: { id: string; role: string; ip?: string },
  ): Promise<void> {
    const user = await this.findOne(id);

    if (!forceDelete) {
      const assignmentsCount = await this.checkActiveAssignments(user);
      if (assignmentsCount > 0) {
        throw new ConflictException({
          message: 'User has active audit assignments',
          assignmentCount: assignmentsCount,
        });
      }
    }

    await this.repository.softRemove(user);

    await this.auditTrailService.log({
      actorId: actor?.id,
      actorRole: actor?.role,
      action: AuditAction.USER_DELETED,
      entityType: 'users',
      entityId: user.id,
      metadata: { email: user.email, forceDelete },
      ipAddress: actor?.ip,
    });
  }

  private async checkActiveAssignments(user: User): Promise<number> {
    let count = 0;

    if (user.role === UserRole.AUDITOR) {
      count = await this.assignmentRepository.count({
        where: {
          auditorId: user.id,
          audit: { status: AuditStatus.IN_PROGRESS },
        },
      });
    } else if (user.role === UserRole.MANAGER) {
      count = await this.auditRepository.count({
        where: { managerId: user.id, status: AuditStatus.IN_PROGRESS },
      });
    } else if (user.role === UserRole.CLIENT) {
      count = await this.auditRepository.count({
        where: { clientId: user.id, status: AuditStatus.IN_PROGRESS },
      });
    }

    return count;
  }
}
