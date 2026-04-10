import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
export declare class ClientAuditsService {
    private readonly auditRepo;
    private readonly scopeRepo;
    private readonly abuRepo;
    private readonly logger;
    constructor(auditRepo: Repository<Audit>, scopeRepo: Repository<AuditScopeLineItem>, abuRepo: Repository<AuditBusinessUnit>);
    getProgress(id: string, clientId: string): Promise<{
        totalItems: number;
        submittedItems: number;
        draftItems: number;
        pendingExceptions: number;
        completionPercent: number;
        businessUnits: {
            name: string;
            completionPercent: number;
        }[];
    }>;
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
