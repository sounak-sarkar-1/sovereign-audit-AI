import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull, Not } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import {
  ExceptionalActionRequest,
  ExceptionalRequestStatus,
} from '../../database/entities/exceptional-action-request.entity';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class ManagerAuditsService {
  private readonly logger = new Logger(ManagerAuditsService.name);

  constructor(
    @InjectRepository(Audit)
    private auditRepo: Repository<Audit>,
    @InjectRepository(AuditBusinessUnit)
    private auditBuRepo: Repository<AuditBusinessUnit>,
    @InjectRepository(ManagerClientMapping)
    private managerClientRepo: Repository<ManagerClientMapping>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(AuditorAuditAssignment)
    private assignmentRepo: Repository<AuditorAuditAssignment>,
    @InjectRepository(BusinessUnit)
    private buRepo: Repository<BusinessUnit>,
    @InjectRepository(ExceptionalActionRequest)
    private requestRepo: Repository<ExceptionalActionRequest>,
    @InjectRepository(AuditScopeLineItem)
    private lineItemRepo: Repository<AuditScopeLineItem>,
    private dataSource: DataSource,
    private auditTrailService: AuditTrailService,
  ) {}

  async findAll(
    managerId: string,
    page: number = 1,
    limit: number = 10,
    status?: AuditStatus,
  ) {
    const query = this.auditRepo
      .createQueryBuilder('audit')
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

    const auditsWithStats = await Promise.all(
      audits.map(async (audit) => {
        const stats = await this.calculateStats(audit.id);
        const { auditorCount, hasPendingExceptionalRequest } = await this.getLegacyStats(audit.id);

        return {
          ...audit,
          auditorCount,
          completionPercentage: stats.completionPercentage,
          openExceptionsCount: stats.openExceptionsCount,
          hasPendingExceptionalRequest,
        };
      }),
    );

    return {
      items: auditsWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getClients(managerId: string) {
    const mappings = await this.managerClientRepo.find({
      where: { managerId, deletedAt: IsNull() },
      relations: ['client'],
    });
    return mappings.map((m) => m.client);
  }

  async create(createDto: CreateAuditDto, managerId: string) {
    const mapping = await this.managerClientRepo.findOne({
      where: { managerId, clientId: createDto.clientId, deletedAt: IsNull() },
    });
    if (!mapping) {
      throw new BadRequestException('Client is not mapped to this manager');
    }

    const now = new Date();
    const startDate = new Date(createDto.startDate);
    const expectedEndDate = new Date(createDto.expectedCompletionDate);

    if (startDate < new Date(now.setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Start date cannot be in the past');
    }
    if (expectedEndDate <= startDate) {
      throw new BadRequestException(
        'Expected completion date must be after start date',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const audit = this.auditRepo.create({
        ...createDto,
        managerId,
        status: AuditStatus.DRAFT,
      });
      const savedAudit = await queryRunner.manager.save(audit);

      const auditBUs = createDto.businessUnitIds.map((buId) =>
        queryRunner.manager.create(AuditBusinessUnit, {
          auditId: savedAudit.id,
          businessUnitId: buId,
        }),
      );
      await queryRunner.manager.save(auditBUs);

      await queryRunner.commitTransaction();

      await this.auditTrailService.log({
        actorId: managerId,
        action: AuditAction.AUDIT_CREATED,
        entityType: 'Audit',
        entityId: savedAudit.id,
        metadata: { name: savedAudit.name },
      });

      return this.findOne(savedAudit.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create audit: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to create audit');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'manager'],
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    const auditBUs = await this.auditBuRepo.find({
      where: { auditId: id, deletedAt: IsNull() },
      relations: ['businessUnit'],
    });

    const assignments = await this.assignmentRepo.find({
      where: { auditId: id, deletedAt: IsNull() },
      relations: ['auditor'],
    });

    const stats = await this.calculateStats(id);

    const result = {
      ...audit,
      businessUnits: auditBUs.map((abu) => ({
        ...abu.businessUnit,
        id: abu.id,
        realBusinessUnitId: abu.businessUnitId,
      })),
      assignments,
      completionPercentage: stats.completionPercentage,
      openExceptionsCount: stats.openExceptionsCount,
      incompleteMandatoryCount: stats.incompleteMandatoryCount,
    };

    this.logger.log(`AuditDetail [${id}]: Progress=${result.completionPercentage}%`);
    return result;
  }

  private async calculateStats(auditId: string) {
    const totalItems = await this.lineItemRepo.count({
      where: { auditId, deletedAt: IsNull() },
    });

    const completedItems = await this.lineItemRepo.count({
      where: {
        auditId,
        deletedAt: IsNull(),
        status: In([
          LineItemStatus.SUBMITTED,
          LineItemStatus.EXCEPTION_APPROVED,
        ]),
      },
    });

    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    this.logger.log(`Stats [${auditId}]: Total=${totalItems}, Completed=${completedItems}, Perc=${completionPercentage}%, IncompleteMandatory=${incompleteMandatoryCount}`);

    const incompleteMandatoryCount = await this.lineItemRepo.count({
      where: {
        auditId,
        isOptional: false,
        deletedAt: IsNull(),
        status: Not(
          In([LineItemStatus.SUBMITTED, LineItemStatus.EXCEPTION_APPROVED]),
        ),
      },
    });

    const openExceptionsCount = await this.dataSource
      .createQueryBuilder('exception_requests', 'er')
      .innerJoin(
        'audit_scope_line_items',
        'li',
        'er.audit_scope_line_item_id = li.id',
      )
      .where('li.audit_id = :auditId', { auditId })
      .andWhere('er.status = :status', { status: 'pending' })
      .getCount();

    return {
      totalItems,
      completedItems,
      completionPercentage,
      openExceptionsCount,
      incompleteMandatoryCount,
    };
  }

  private async getLegacyStats(auditId: string) {
    const auditorCountRaw = await this.assignmentRepo
      .createQueryBuilder('assignment')
      .where('assignment.audit_id = :auditId', { auditId })
      .andWhere('assignment.deleted_at IS NULL')
      .select('COUNT(DISTINCT assignment.auditor_id)', 'count')
      .getRawOne();

    const pendingRequest = await this.requestRepo.findOne({
      where: {
        auditId,
        status: ExceptionalRequestStatus.PENDING,
      },
    });

    return {
      auditorCount: parseInt(auditorCountRaw.count) || 0,
      hasPendingExceptionalRequest: !!pendingRequest,
    };
  }

  async update(id: string, updateDto: UpdateAuditDto, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (updateDto.name) audit.name = updateDto.name;
    if (updateDto.description !== undefined)
      audit.description = updateDto.description;
    if (updateDto.expectedCompletionDate) {
      const newEndDate = new Date(updateDto.expectedCompletionDate);
      if (newEndDate <= audit.startDate) {
        throw new BadRequestException(
          'Expected completion date must be after start date',
        );
      }
      audit.expectedCompletionDate = newEndDate;
    }

    await this.auditRepo.save(audit);

    await this.auditTrailService.log({
      actorId: managerId,
      action: AuditAction.AUDIT_UPDATED,
      entityType: 'Audit',
      entityId: id,
      metadata: updateDto,
    });

    return this.findOne(id);
  }

  async start(id: string, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');
    if (audit.status !== AuditStatus.DRAFT)
      throw new BadRequestException('Only draft audits can be started');

    const scopeItemCount = await this.lineItemRepo.count({
      where: { auditId: id, deletedAt: IsNull() },
    });
    if (scopeItemCount === 0) {
      throw new BadRequestException(
        'Cannot start audit without scope line items',
      );
    }

    const auditorAssignmentCount = await this.assignmentRepo.count({
      where: { auditId: id, deletedAt: IsNull() },
    });
    if (auditorAssignmentCount === 0) {
      throw new BadRequestException(
        'Cannot start audit without assigned auditors',
      );
    }

    audit.status = AuditStatus.IN_PROGRESS;
    await this.auditRepo.save(audit);

    await this.auditTrailService.log({
      actorId: managerId,
      action: AuditAction.AUDIT_STARTED,
      entityType: 'Audit',
      entityId: id,
    });

    return this.findOne(id);
  }

  async getTrail(id: string) {
    return this.auditTrailService.findForAudit(id);
  }

  async archive(id: string, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (audit.status !== AuditStatus.CLOSED) {
      throw new UnprocessableEntityException(
        'Only closed audits can be archived. To delete or cancel an in-progress audit, submit an Exceptional Action Request.',
      );
    }

    audit.status = AuditStatus.ARCHIVED;
    await this.auditRepo.save(audit);

    await this.auditTrailService.log({
      actorId: managerId,
      action: AuditAction.AUDIT_ARCHIVED,
      entityType: 'Audit',
      entityId: id,
    });

    return this.findOne(id);
  }
}
