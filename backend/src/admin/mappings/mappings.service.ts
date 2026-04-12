import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { CreateMappingDto } from './dto/create-mapping.dto';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class AdminMappingsService {
  private readonly logger = new Logger(AdminMappingsService.name);

  constructor(
    @InjectRepository(ManagerAuditorMapping)
    private readonly managerAuditorRepo: Repository<ManagerAuditorMapping>,
    @InjectRepository(ManagerClientMapping)
    private readonly managerClientRepo: Repository<ManagerClientMapping>,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async getManagerAuditorMappings(): Promise<ManagerAuditorMapping[]> {
    return await this.managerAuditorRepo.find({
      relations: ['manager', 'auditor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getManagerClientMappings(): Promise<ManagerClientMapping[]> {
    return await this.managerClientRepo.find({
      relations: ['manager', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async addManagerAuditorMapping(
    dto: CreateMappingDto,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const existing = await this.managerAuditorRepo.findOne({
      where: { managerId: dto.managerId, auditorId: dto.targetId },
    });

    if (existing) {
      throw new ConflictException('Mapping already exists');
    }

    const mapping = this.managerAuditorRepo.create({
      managerId: dto.managerId,
      auditorId: dto.targetId,
    });

    await this.managerAuditorRepo.save(mapping);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.MAPPING_CREATED,
      entityType: 'manager_auditor_mapping',
      entityId: mapping.id,
      metadata: dto,
      ipAddress: actor.ip,
    });
  }

  async removeManagerAuditorMapping(
    managerId: string,
    auditorId: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const mapping = await this.managerAuditorRepo.findOne({
      where: { managerId, auditorId },
    });

    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }

    await this.managerAuditorRepo.softRemove(mapping);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.MAPPING_DELETED,
      entityType: 'manager_auditor_mapping',
      entityId: mapping.id,
      metadata: { managerId, auditorId },
      ipAddress: actor.ip,
    });
  }

  async addManagerClientMapping(
    dto: CreateMappingDto,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const existing = await this.managerClientRepo.findOne({
      where: { managerId: dto.managerId, clientId: dto.targetId },
    });

    if (existing) {
      throw new ConflictException('Mapping already exists');
    }

    const mapping = this.managerClientRepo.create({
      managerId: dto.managerId,
      clientId: dto.targetId,
    });

    await this.managerClientRepo.save(mapping);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.MAPPING_CREATED,
      entityType: 'manager_client_mapping',
      entityId: mapping.id,
      metadata: dto,
      ipAddress: actor.ip,
    });
  }

  async removeManagerClientMapping(
    managerId: string,
    clientId: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const mapping = await this.managerClientRepo.findOne({
      where: { managerId, clientId },
    });

    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }

    await this.managerClientRepo.softRemove(mapping);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.MAPPING_DELETED,
      entityType: 'manager_client_mapping',
      entityId: mapping.id,
      metadata: { managerId, clientId },
      ipAddress: actor.ip,
    });
  }
}
