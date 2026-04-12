import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import {
  AuditScopeLineItem,
  LineItemStatus,
} from '../../database/entities/audit-scope-line-item.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';

@Injectable()
export class HeatmapService {
  private readonly logger = new Logger(HeatmapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ManagerAuditorMapping)
    private readonly mappingRepo: Repository<ManagerAuditorMapping>,
    @InjectRepository(AuditorAuditAssignment)
    private readonly buAssignmentRepo: Repository<AuditorAuditAssignment>,
    @InjectRepository(AuditScopeLineItem)
    private readonly scopeRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async getHeatmap(managerId: string, auditId?: string) {
    // 1. Get all auditors mapped to this manager
    const mappings = await this.mappingRepo.find({
      where: { managerId, deletedAt: IsNull() },
      relations: ['auditor'],
    });
    const auditors = mappings.map((m) => m.auditor);
    const auditorIds = auditors.map((a) => a.id);

    if (auditorIds.length === 0) {
      return {
        kpis: {
          openLineItems: 0,
          completionPercent: 0,
          activeEngagementsCount: 0,
        },
        auditors: [],
      };
    }

    // 2. Get all active audits for these auditors (assigned to at least one BU)
    const assignments = await this.buAssignmentRepo.find({
      where: {
        auditorId: In(auditorIds),
        deletedAt: IsNull(),
        ...(auditId ? { auditId } : {}),
      },
      relations: [
        'audit',
        'auditBusinessUnit',
        'auditBusinessUnit.businessUnit',
      ],
    });

    // 3. Get line item stats for these auditors
    // Note: Line items are assigned to auditors via auditor_line_item_assignments
    // OR implicitly via BU assignment (if not granularly assigned).
    // The spec says: "breakdown by audit+BU".
    // We'll query line items by BU for assigned auditors.

    // Actually, we need to know WHICH line items an auditor is responsible for.
    // If they are assigned to a BU, they are responsible for all line items in that BU UNLESS those items are granularly assigned to someone else.
    // However, the prompt says "POST /manager/audits/:id/assignments/line-items — assign auditor to specific line item (optional granularity)".
    // So we should check both.

    const heatmapData = await Promise.all(
      auditors.map(async (auditor) => {
        const auditorAssignments = assignments.filter(
          (a) => a.auditorId === auditor.id,
        );
        const auditDetails = await Promise.all(
          [...new Set(auditorAssignments.map((a) => a.auditId))].map(
            async (aId) => {
              const audit = auditorAssignments.find(
                (a) => a.auditId === aId,
              ).audit;
              const bus = auditorAssignments
                .filter((a) => a.auditId === aId)
                .map((a) => ({
                  id: a.auditBusinessUnitId,
                  name: a.auditBusinessUnit.businessUnit.name,
                }));

              // Get line items for these BUs
              const buIds = bus.map((b) => b.id);
              const lineItems = await this.scopeRepo.find({
                where: { auditBusinessUnitId: In(buIds), deletedAt: IsNull() },
              });

              const openItems = lineItems.filter(
                (li) =>
                  li.status !== LineItemStatus.SUBMITTED &&
                  li.status !== LineItemStatus.EXCEPTION_APPROVED,
              ).length;
              const totalItems = lineItems.length;

              return {
                auditId: aId,
                auditName: audit.name,
                businessUnits: bus,
                openItems,
                totalItems,
                completionPercent:
                  totalItems > 0
                    ? Math.round(((totalItems - openItems) / totalItems) * 100)
                    : 100,
              };
            },
          ),
        );

        const activeEngagementsCount = auditDetails.filter(
          (ad) => ad.totalItems > 0,
        ).length;
        const totalOpenItems = auditDetails.reduce(
          (sum, ad) => sum + ad.openItems,
          0,
        );
        const totalItems = auditDetails.reduce(
          (sum, ad) => sum + ad.totalItems,
          0,
        );

        return {
          id: auditor.id,
          fullName: auditor.fullName,
          email: auditor.email,
          activeEngagementsCount,
          openLineItems: totalOpenItems,
          completionPercent:
            totalItems > 0
              ? Math.round(((totalItems - totalOpenItems) / totalItems) * 100)
              : 100,
          breakdown: auditDetails,
        };
      }),
    );

    const totalOpen = heatmapData.reduce((sum, a) => sum + a.openLineItems, 0);
    const totalItems = heatmapData.reduce(
      (sum, a) =>
        sum + (a.openLineItems / (a.completionPercent / 100 || 1) || 0),
      0,
    ); // rough estimate
    // Re-calculating total items accurately
    const allTotalItems = heatmapData.reduce((sum, a) => {
      const audTotal = a.breakdown.reduce((s, b) => s + b.totalItems, 0);
      return sum + audTotal;
    }, 0);

    return {
      kpis: {
        openLineItems: totalOpen,
        completionPercent:
          allTotalItems > 0
            ? Math.round(((allTotalItems - totalOpen) / allTotalItems) * 100)
            : 100,
        activeEngagementsCount: [...new Set(assignments.map((a) => a.auditId))]
          .length,
      },
      auditors: heatmapData,
    };
  }
}
