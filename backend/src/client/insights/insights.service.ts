import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest, ExceptionStatus } from '../../database/entities/exception-request.entity';

@Injectable()
export class ClientInsightsService {
  private readonly logger = new Logger(ClientInsightsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(ExceptionRequest)
    private readonly exceptionRepo: Repository<ExceptionRequest>,
  ) {}

  async getGlobalInsights(clientId: string) {
    const audits = await this.auditRepo.find({
      where: { clientId, status: AuditStatus.CLOSED },
      order: { expectedCompletionDate: 'ASC' },
      relations: ['manager'],
    });

    if (audits.length === 0) {
      return { data: { auditsCount: 0, complianceTrend: [], riskByBu: [], recurringFindings: [] } };
    }

    // 1. Audit Frequency & Compliance Trend
    const complianceTrend = audits.map(audit => ({
      auditId: audit.id,
      name: audit.name,
      date: audit.expectedCompletionDate,
      score: 100, // Placeholder for real scoring logic
    }));

    // 2. Risk by BU (based on exceptions)
    const riskByBu = await this.lineItemRepo.createQueryBuilder('li')
      .leftJoin('li.audit', 'audit')
      .leftJoin('li.auditBusinessUnit', 'bu')
      .select('bu.name', 'buName')
      .addSelect('COUNT(li.id)', 'totalItems')
      .addSelect('SUM(CASE WHEN li.status = :exApproved THEN 1 ELSE 0 END)', 'exceptionCount', { exApproved: LineItemStatus.EXCEPTION_APPROVED })
      .where('audit.clientId = :clientId', { clientId })
      .andWhere('audit.status = :closed', { closed: AuditStatus.CLOSED })
      .groupBy('bu.name')
      .getRawMany();

    return {
      data: {
        auditsCount: audits.length,
        complianceTrend,
        riskByBu: riskByBu.map(r => ({
          buName: r.buName,
          rate: r.totalItems > 0 ? (r.exceptionCount / r.totalItems) * 100 : 0,
        })),
        recurringFindings: [], // Placeholder
      }
    };
  }
}
