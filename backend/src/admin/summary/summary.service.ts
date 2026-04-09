import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest, ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';

@Injectable()
export class AdminSummaryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    @InjectRepository(ExceptionalActionRequest)
    private readonly requestRepository: Repository<ExceptionalActionRequest>,
  ) {}

  async getDashboardSummary() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, activeAudits, pendingRequests, closedAudits, totalRecentAudits] = await Promise.all([
      this.userRepository.count(),
      this.auditRepository.count({ where: { status: AuditStatus.IN_PROGRESS } }),
      this.requestRepository.count({ where: { status: ExceptionalRequestStatus.PENDING } }),
      this.auditRepository.count({ 
        where: { status: AuditStatus.CLOSED, updatedAt: MoreThanOrEqual(thirtyDaysAgo) } 
      }),
      this.auditRepository.count({ 
        where: { updatedAt: MoreThanOrEqual(thirtyDaysAgo) } 
      }),
    ]);

    const systemHealth = totalRecentAudits > 0
      ? `${Math.round((closedAudits / totalRecentAudits) * 100)}%`
      : 'N/A';

    return {
      totalUsers,
      activeAudits,
      pendingRequests,
      systemHealth,
    };
  }
}
