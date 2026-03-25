import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Audit } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
export declare class AdminSummaryService {
    private readonly userRepository;
    private readonly auditRepository;
    private readonly requestRepository;
    constructor(userRepository: Repository<User>, auditRepository: Repository<Audit>, requestRepository: Repository<ExceptionalActionRequest>);
    getDashboardSummary(): Promise<{
        totalUsers: number;
        activeAudits: number;
        pendingRequests: number;
        systemHealth: string;
    }>;
}
