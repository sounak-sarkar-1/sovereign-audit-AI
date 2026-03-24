import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { User } from '../../database/entities/user.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';

@Injectable()
export class AuditorAuditsService {
  private readonly logger = new Logger(AuditorAuditsService.name);

  constructor(
    @InjectRepository(AuditorAuditAssignment)
    private readonly assignmentRepo: Repository<AuditorAuditAssignment>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(AuditBusinessUnit)
    private readonly auditBURepo: Repository<AuditBusinessUnit>,
  ) {}

  async findAll(user: User) {
    const assignments = await this.assignmentRepo.find({
      where: { auditorId: user.id },
      relations: ['audit', 'audit.client'],
    });

    const auditIds = [...new Set(assignments.map(a => a.auditId))];
    if (auditIds.length === 0) return [];

    const audits = await this.auditRepo.find({
      where: { id: In(auditIds) },
      relations: ['client'],
    });

    // Calculate completion for each audit (own items only)
    const results = await Promise.all(audits.map(async (audit) => {
      const totalItems = await this.lineItemRepo.count({
        where: { auditId: audit.id, assignments: { auditorId: user.id } },
      });
      
      const completedItems = await this.lineItemRepo.count({
        where: { 
          auditId: audit.id, 
          assignments: { auditorId: user.id },
          status: In([LineItemStatus.SUBMITTED, LineItemStatus.EXCEPTION_APPROVED])
        },
      });

      return {
        ...audit,
        completionStats: {
          total: totalItems,
          completed: completedItems,
          percent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        }
      };
    }));

    return results;
  }

  async findOne(auditId: string, user: User) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId },
      relations: ['client'],
    });

    if (!audit) throw new NotFoundException('Audit not found');

    // Get BUs and co-auditor completion stats
    const bus = await this.auditBURepo.find({
      where: { auditId },
      relations: ['businessUnit'],
    });

    const buStats = await Promise.all(bus.map(async (bu) => {
      const totalItems = await this.lineItemRepo.count({
        where: { auditBusinessUnitId: bu.id },
      });

      const completedItems = await this.lineItemRepo.count({
        where: { 
          auditBusinessUnitId: bu.id,
          status: In([LineItemStatus.SUBMITTED, LineItemStatus.EXCEPTION_APPROVED])
        },
      });

      return {
        id: bu.id,
        name: bu.businessUnit.name,
        totalItems,
        completedItems,
        completionPercent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      };
    }));

    return {
      ...audit,
      businessUnits: buStats,
    };
  }
}

