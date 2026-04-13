import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import {
  AuditScopeLineItem,
  LineItemStatus,
} from '../../database/entities/audit-scope-line-item.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';

@Injectable()
export class ClientAuditsService {
  private readonly logger = new Logger(ClientAuditsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditScopeLineItem)
    private readonly scopeRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(AuditBusinessUnit)
    private readonly abuRepo: Repository<AuditBusinessUnit>,
  ) {}

  async getProgress(id: string, clientId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, clientId },
    });

    if (!audit || audit.status === AuditStatus.DRAFT) {
      throw new NotFoundException('Audit not found');
    }

    const scopeItems = await this.scopeRepo.find({
      where: { auditId: id },
      relations: ['auditBusinessUnit', 'auditBusinessUnit.businessUnit'],
    });

    const totalItems = scopeItems.length;
    const submittedItems = scopeItems.filter(
      (i) =>
        i.status === LineItemStatus.SUBMITTED ||
        i.status === LineItemStatus.EXCEPTION_APPROVED,
    ).length;
    const draftItems = scopeItems.filter(
      (i) => i.status === LineItemStatus.DRAFT_SAVED,
    ).length;
    const pendingExceptions = scopeItems.filter(
      (i) => i.status === LineItemStatus.EXCEPTION_PENDING,
    ).length;
    const completionPercent =
      totalItems > 0 ? Math.round((submittedItems / totalItems) * 100) : 0;

    // Group by Business Unit
    const buMap = new Map<
      string,
      { name: string; total: number; submitted: number }
    >();

    // Initialize with all BUs assigned to the audit
    const abus = await this.abuRepo.find({
      where: { auditId: id },
      relations: ['businessUnit'],
    });

    abus.forEach((abu) => {
      buMap.set(abu.id, {
        name: abu.businessUnit?.name || 'Unknown',
        total: 0,
        submitted: 0,
      });
    });

    scopeItems.forEach((item) => {
      const buStats = buMap.get(item.auditBusinessUnitId);
      if (buStats) {
        buStats.total++;
        if (
          item.status === LineItemStatus.SUBMITTED ||
          item.status === LineItemStatus.EXCEPTION_APPROVED
        ) {
          buStats.submitted++;
        }
      }
    });

    const businessUnits = Array.from(buMap.values()).map((bu) => ({
      name: bu.name,
      completionPercent:
        bu.total > 0 ? Math.round((bu.submitted / bu.total) * 100) : 0,
    }));

    return {
      totalItems,
      submittedItems,
      draftItems,
      pendingExceptions,
      completionPercent,
      businessUnits,
    };
  }

  async findAll(
    clientId: string,
    page: number = 1,
    limit: number = 10,
    status?: AuditStatus,
  ) {
    const query = this.auditRepo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.manager', 'manager')
      .where('audit.clientId = :clientId', { clientId })
      .andWhere('audit.status != :status', { status: AuditStatus.DRAFT }); // Clients don't see drafts

    if (status) {
      query.andWhere('audit.status = :status', { status });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('audit.createdAt', 'DESC')
      .getManyAndCount();

    const enrichedItems = await Promise.all(
      items.map(async (audit) => {
        const latestReport = await this.auditRepo.manager
          .createQueryBuilder('audit_reports', 'report')
          .where('report.audit_id = :auditId', { auditId: audit.id })
          .andWhere('report.status = :status', { status: 'final' })
          .orderBy('report.version', 'DESC')
          .getOne();

        let previousCompliancePercentage = null;
        if (audit.previousAuditId) {
          const prevReport = await this.auditRepo.manager
            .createQueryBuilder('audit_reports', 'report')
            .where('report.audit_id = :auditId', { auditId: audit.previousAuditId })
            .andWhere('report.status = :status', { status: 'final' })
            .orderBy('report.version', 'DESC')
            .getOne();
          previousCompliancePercentage = prevReport
            ? Number(prevReport.compliancePercentage)
            : null;
        }

        return {
          ...audit,
          compliancePercentage: latestReport
            ? Number(latestReport.compliancePercentage)
            : null,
          hasPrevious: !!audit.previousAuditId,
          previousCompliancePercentage,
        };
      }),
    );

    return {
      data: enrichedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, clientId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, clientId },
      relations: ['manager'],
    });

    if (!audit || audit.status === AuditStatus.DRAFT) {
      throw new NotFoundException('Audit not found');
    }

    const latestReport = await this.auditRepo.manager
      .createQueryBuilder('audit_reports', 'report')
      .where('report.audit_id = :auditId', { auditId: audit.id })
      .andWhere('report.status = :status', { status: 'final' })
      .orderBy('report.version', 'DESC')
      .getOne();

    let previousCompliancePercentage = null;
    if (audit.previousAuditId) {
      const prevReport = await this.auditRepo.manager
        .createQueryBuilder('audit_reports', 'report')
        .where('report.audit_id = :auditId', { auditId: audit.previousAuditId })
        .andWhere('report.status = :status', { status: 'final' })
        .orderBy('report.version', 'DESC')
        .getOne();
      previousCompliancePercentage = prevReport
        ? Number(prevReport.compliancePercentage)
        : null;
    }

    return {
      data: {
        ...audit,
        compliancePercentage: latestReport
          ? Number(latestReport.compliancePercentage)
          : null,
        hasPrevious: !!audit.previousAuditId,
        previousCompliancePercentage,
      },
    };
  }
}
