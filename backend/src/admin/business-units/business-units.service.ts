import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class AdminBusinessUnitsService {
  private readonly logger = new Logger(AdminBusinessUnitsService.name);

  constructor(
    @InjectRepository(BusinessUnit)
    private readonly repository: Repository<BusinessUnit>,
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async create(
    clientId: string,
    createDto: CreateBusinessUnitDto,
    actor: { id: string; role: string; ip: string },
  ): Promise<BusinessUnit> {
    const unit = this.repository.create({
      ...createDto,
      clientId,
    });
    const savedUnit = await this.repository.save(unit);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_UPDATED, // Or a more specific action if we had it
      entityType: 'client_business_units',
      entityId: savedUnit.id,
      metadata: { clientId, ...createDto },
      ipAddress: actor.ip,
    });

    return savedUnit;
  }

  async findAllByClient(clientId: string): Promise<BusinessUnit[]> {
    return await this.repository.find({
      where: { clientId },
      order: { name: 'ASC' },
    });
  }

  async findOne(clientId: string, id: string): Promise<BusinessUnit> {
    const unit = await this.repository.findOne({ where: { id, clientId } });
    if (!unit) {
      throw new NotFoundException(
        `Business Unit with ID "${id}" not found for this client`,
      );
    }
    return unit;
  }

  async update(
    clientId: string,
    id: string,
    updateDto: UpdateBusinessUnitDto,
    actor: { id: string; role: string; ip: string },
  ): Promise<BusinessUnit> {
    const unit = await this.findOne(clientId, id);
    Object.assign(unit, updateDto);
    const updatedUnit = await this.repository.save(unit);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_UPDATED,
      entityType: 'client_business_units',
      entityId: updatedUnit.id,
      metadata: { clientId, ...updateDto },
      ipAddress: actor.ip,
    });

    return updatedUnit;
  }

  async remove(
    clientId: string,
    id: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const unit = await this.findOne(clientId, id);

    // Check for active audits
    // Business rule: block if BU is part of an active audit (status not closed/deleted)
    // We need to check AuditBusinessUnit relation
    const activeAuditsCount = await this.auditRepository
      .createQueryBuilder('audit')
      .innerJoin('audit_business_units', 'abu', 'abu.audit_id = audit.id')
      .where('abu.business_unit_id = :buId', { buId: id })
      .andWhere('audit.status NOT IN (:...statuses)', {
        statuses: [AuditStatus.CLOSED, AuditStatus.DELETED],
      })
      .getCount();

    if (activeAuditsCount > 0) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_ERROR',
        message: 'Cannot delete Business Unit as it is part of an active audit',
        activeAuditCount: activeAuditsCount,
      });
    }

    await this.repository.softRemove(unit);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_UPDATED,
      entityType: 'client_business_units',
      entityId: unit.id,
      metadata: { clientId, id },
      ipAddress: actor.ip,
    });
  }
}
