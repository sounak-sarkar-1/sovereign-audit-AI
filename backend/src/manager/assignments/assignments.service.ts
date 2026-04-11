import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditorLineItemAssignment } from '../../database/entities/auditor-line-item-assignment.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { AssignAuditorDto } from './dto/assign-auditor.dto';
import { AssignLineItemDto } from './dto/assign-line-item.dto';

@Injectable()
export class ManagerAssignmentsService {
  private readonly logger = new Logger(ManagerAssignmentsService.name);

  constructor(
    @InjectRepository(AuditorAuditAssignment)
    private readonly buAssignmentRepo: Repository<AuditorAuditAssignment>,
    @InjectRepository(AuditorLineItemAssignment)
    private readonly liAssignmentRepo: Repository<AuditorLineItemAssignment>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditBusinessUnit)
    private readonly abuRepo: Repository<AuditBusinessUnit>,
    @InjectRepository(AuditScopeLineItem)
    private readonly scopeRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(ManagerAuditorMapping)
    private readonly mappingRepo: Repository<ManagerAuditorMapping>,
    private readonly auditTrailService: AuditTrailService,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  private async getAuditBuName(abuId: string) {
    const abu = await this.abuRepo.findOne({
      where: { id: abuId },
      relations: ['businessUnit'],
    });
    return abu?.businessUnit?.name || 'Unknown BU';
  }

  async getAssignments(auditId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    // Get all BUs for this audit
    const bus = await this.abuRepo.find({
      where: { auditId, deletedAt: IsNull() },
      relations: ['businessUnit'],
    });

    // Get all BU assignments
    const buAssignments = await this.buAssignmentRepo.find({
      where: { auditId, deletedAt: IsNull() },
      relations: ['auditor'],
    });

    // Get all line items for this audit with their assignments
    const lineItems = await this.scopeRepo.find({
      where: { auditId, deletedAt: IsNull() },
      order: { displayOrder: 'ASC' },
      relations: ['auditBusinessUnit', 'auditBusinessUnit.businessUnit'],
    });

    const liAssignments = await this.liAssignmentRepo.find({
      where: { deletedAt: IsNull() },
      relations: ['auditor', 'auditScopeLineItem'],
    });

    // Filter liAssignments for this audit
    const filteredLiAssignments = liAssignments.filter(la => la.auditScopeLineItem?.auditId === auditId);

    // Derive unique auditors from buAssignments
    const auditors = Array.from(
      new Map(buAssignments.map(a => [a.auditorId, a.auditor])).values()
    );

    // Get all auditors mapped to this manager
    const availableAuditors = await this.mappingRepo.find({
      where: { managerId: audit.managerId, deletedAt: IsNull() },
      relations: ['auditor'],
    });

    return {
      audit,
      businessUnits: bus,
      buAssignments,
      auditors,
      availableAuditors: availableAuditors.map(m => m.auditor),
      lineItems: lineItems.map(li => ({
        ...li,
        assignment: filteredLiAssignments.find(la => la.auditScopeLineItemId === li.id),
      })),
      lineItemAssignments: filteredLiAssignments,
    };
  }

  async assignToBU(auditId: string, dto: AssignAuditorDto, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (audit.status !== AuditStatus.DRAFT && audit.status !== AuditStatus.REOPENED) {
      throw new UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
    }

    // Validate auditor belongs to this manager
    const mapping = await this.mappingRepo.findOne({
      where: { managerId, auditorId: dto.auditorId, deletedAt: IsNull() },
    });
    if (!mapping) throw new UnprocessableEntityException('Auditor is not mapped to this manager');

    // Validate BU belongs to this audit
    const abu = await this.abuRepo.findOne({
      where: { id: dto.auditBusinessUnitId, auditId, deletedAt: IsNull() },
    });
    if (!abu) throw new UnprocessableEntityException('Business Unit does not belong to this audit');

    // Check for existing assignment (including soft-deleted)
    const existing = await this.buAssignmentRepo.findOne({
      where: { auditBusinessUnitId: dto.auditBusinessUnitId, auditorId: dto.auditorId },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore soft-deleted record
        existing.deletedAt = null;
        await this.buAssignmentRepo.save(existing);
      }
      return existing;
    }

    const assignment = this.buAssignmentRepo.create({
      auditId,
      auditorId: dto.auditorId,
      auditBusinessUnitId: dto.auditBusinessUnitId,
    });

    try {
      const saved = await this.buAssignmentRepo.save(assignment);

      await this.auditTrailService.log({
        actorId: managerId,
        action: AuditAction.AUDITOR_ASSIGNED,
        entityType: 'AuditorAuditAssignment',
        entityId: saved.id,
        metadata: { auditId, auditorId: dto.auditorId, abuId: dto.auditBusinessUnitId },
      });

      await this.notificationsService.create({
        userId: dto.auditorId,
        type: NotificationType.AUDIT_ASSIGNED,
        title: 'You have been assigned to an audit',
        message: `You have been assigned to audit "${audit.name}" for ${await this.getAuditBuName(dto.auditBusinessUnitId)}`,
        relatedEntityType: 'AuditorAuditAssignment',
        relatedEntityId: saved.id,
        metadata: { auditId },
      });

      return saved;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new UnprocessableEntityException('This auditor is already assigned to this business unit');
      }
      this.logger.error(`Assignment failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async unassignFromBU(auditId: string, assignmentId: string, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (audit.status !== AuditStatus.DRAFT && audit.status !== AuditStatus.REOPENED) {
      throw new UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
    }

    const assignment = await this.buAssignmentRepo.findOne({
      where: { id: assignmentId, auditId, deletedAt: IsNull() },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.buAssignmentRepo.softRemove(assignment);
  }

  async assignToLineItem(auditId: string, dto: AssignLineItemDto, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (audit.status !== AuditStatus.DRAFT && audit.status !== AuditStatus.REOPENED) {
      throw new UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
    }

    // Validate line item belongs to this audit
    const li = await this.scopeRepo.findOne({
      where: { id: dto.lineItemId, auditId, deletedAt: IsNull() },
    });
    if (!li) throw new UnprocessableEntityException('Line item does not belong to this audit');

    // Check existing (including soft-deleted)
    const existing = await this.liAssignmentRepo.findOne({
      where: { auditScopeLineItemId: dto.lineItemId, auditorId: dto.auditorId },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        existing.deletedAt = null;
        await this.liAssignmentRepo.save(existing);
      }
      return existing;
    }

    // Remove any other auditor from this line item
    const existingAssignments = await this.liAssignmentRepo.find({
      where: { auditScopeLineItemId: dto.lineItemId, deletedAt: IsNull() },
    });
    
    if (existingAssignments.length > 0) {
      await this.liAssignmentRepo.softRemove(existingAssignments);
    }

    const assignment = this.liAssignmentRepo.create({
      auditScopeLineItemId: dto.lineItemId,
      auditorId: dto.auditorId,
    });

    try {
      return await this.liAssignmentRepo.save(assignment);
    } catch (error) {
      if (error.code === '23505') {
        throw new UnprocessableEntityException('This auditor is already assigned to this line item');
      }
      throw error;
    }
  }

  async unassignFromLineItem(auditId: string, assignmentId: string, managerId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId, managerId, deletedAt: IsNull() },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    if (audit.status !== AuditStatus.DRAFT && audit.status !== AuditStatus.REOPENED) {
      throw new UnprocessableEntityException('Auditor assignments blocked: audit is in progress or completed');
    }

    const assignment = await this.liAssignmentRepo.findOne({
      where: { id: assignmentId, deletedAt: IsNull() },
      relations: ['auditScopeLineItem'],
    });
    
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.auditScopeLineItem?.auditId !== auditId) throw new UnprocessableEntityException('Assignment does not belong to this audit');

    await this.liAssignmentRepo.softRemove(assignment);
  }
}
