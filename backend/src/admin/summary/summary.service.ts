import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const [totalUsers, activeAudits, pendingRequests] = await Promise.all([
      this.userRepository.count(),
      this.auditRepository.count({ where: { status: AuditStatus.IN_PROGRESS } }),
      this.requestRepository.count({ where: { status: ExceptionalRequestStatus.PENDING } }),
    ]);

    return {
      totalUsers,
      activeAudits,
      pendingRequests,
      systemHealth: '99.9%', // Still static as per UI requirement, but can be dynamic later
    };
  }
}
