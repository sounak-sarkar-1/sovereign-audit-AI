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
    private readonly dataSource: DataSource,
  ) {}

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

    return {
      audit,
      businessUnits: bus,
      buAssignments,
      lineItems: lineItems.map(li => ({
        ...li,
        assignment: filteredLiAssignments.find(la => la.auditScopeLineItemId === li.id),
      })),
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

    // Check for existing assignment
    const existing = await this.buAssignmentRepo.findOne({
      where: { auditBusinessUnitId: dto.auditBusinessUnitId, auditorId: dto.auditorId, deletedAt: IsNull() },
    });
    if (existing) return existing;

    const assignment = this.buAssignmentRepo.create({
      auditId,
      auditorId: dto.auditorId,
      auditBusinessUnitId: dto.auditBusinessUnitId,
    });

    const saved = await this.buAssignmentRepo.save(assignment);

    await this.auditTrailService.log({
      actorId: managerId,
      action: AuditAction.AUDITOR_ASSIGNED,
      entityType: 'AuditorAuditAssignment',
      entityId: saved.id,
      metadata: { auditId, auditorId: dto.auditorId, abuId: dto.auditBusinessUnitId },
    });

    return saved;
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

    // Check existing
    const existing = await this.liAssignmentRepo.findOne({
      where: { auditScopeLineItemId: dto.lineItemId, auditorId: dto.auditorId, deletedAt: IsNull() },
    });
    if (existing) return existing;

    // Remove any other auditor from this line item
    await this.liAssignmentRepo.softRemove({ auditScopeLineItemId: dto.lineItemId });

    const assignment = this.liAssignmentRepo.create({
      auditScopeLineItemId: dto.lineItemId,
      auditorId: dto.auditorId,
    });

    return await this.liAssignmentRepo.save(assignment);
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
