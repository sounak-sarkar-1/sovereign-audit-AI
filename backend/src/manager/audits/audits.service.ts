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
import { Repository, DataSource, In, IsNull } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
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
        const auditorCount = await this.assignmentRepo
          .createQueryBuilder('assignment')
          .where('assignment.audit_id = :auditId', { auditId: audit.id })
          .andWhere('assignment.deleted_at IS NULL')
          .select('COUNT(DISTINCT assignment.auditor_id)', 'count')
          .getRawOne();

        const lineItemStats = await this.dataSource.query(
          `SELECT 
          COUNT(*) FILTER (WHERE is_optional = false) as total,
          COUNT(*) FILTER (WHERE is_optional = false AND status IN ('submitted', 'exception_approved')) as completed
        FROM audit_scope_line_items 
        WHERE audit_id = $1 AND deleted_at IS NULL`,
          [audit.id],
        );
        const totalItems = parseInt(lineItemStats[0].total);
        const completedItems = parseInt(lineItemStats[0].completed);
        const completionPercentage =
          totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const openExceptions = await this.dataSource.query(
          `SELECT COUNT(*) as count 
        FROM exception_requests er
        JOIN audit_scope_line_items li ON er.audit_scope_line_item_id = li.id
        WHERE li.audit_id = $1 AND er.status = 'pending'`,
          [audit.id],
        );
        const openExceptionsCount = parseInt(openExceptions[0].count);

        const pendingRequest = await this.requestRepo.findOne({
          where: {
            auditId: audit.id,
            status: ExceptionalRequestStatus.PENDING,
          },
        });

        return {
          ...audit,
          auditorCount: parseInt(auditorCount.count),
          completionPercentage,
          openExceptionsCount,
          hasPendingExceptionalRequest: !!pendingRequest,
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

    return {
      ...audit,
      businessUnits: auditBUs.map((abu) => ({
        ...abu.businessUnit,
        id: abu.id, // This is the audit_business_unit_id needed for assignments and scope
        realBusinessUnitId: abu.businessUnitId, // Keep the actual BU ID if needed
      })),
      assignments,
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

    const scopeItemCount = await this.dataSource.query(
      `SELECT COUNT(*) FROM audit_scope_line_items WHERE audit_id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (parseInt(scopeItemCount[0].count) === 0) {
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
