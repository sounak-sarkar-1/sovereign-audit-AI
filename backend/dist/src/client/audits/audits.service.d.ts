import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
export declare class ClientAuditsService {
    private readonly auditRepo;
    private readonly logger;
    constructor(auditRepo: Repository<Audit>);
    findAll(clientId: string, page?: number, limit?: number, status?: AuditStatus): Promise<{
        data: Audit[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, clientId: string): Promise<{
        data: Audit;
    }>;
}
