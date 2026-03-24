import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';
export declare class HeatmapService {
    private readonly userRepo;
    private readonly mappingRepo;
    private readonly buAssignmentRepo;
    private readonly scopeRepo;
    private readonly auditRepo;
    private readonly logger;
    constructor(userRepo: Repository<User>, mappingRepo: Repository<ManagerAuditorMapping>, buAssignmentRepo: Repository<AuditorAuditAssignment>, scopeRepo: Repository<AuditScopeLineItem>, auditRepo: Repository<Audit>);
    getHeatmap(managerId: string, auditId?: string): Promise<{
        kpis: {
            openLineItems: number;
            completionPercent: number;
            activeEngagementsCount: number;
        };
        auditors: {
            id: string;
            fullName: string;
            email: string;
            activeEngagementsCount: number;
            openLineItems: number;
            completionPercent: number;
            breakdown: {
                auditId: string;
                auditName: string;
                businessUnits: {
                    id: string;
                    name: string;
                }[];
                openItems: number;
                totalItems: number;
                completionPercent: number;
            }[];
        }[];
    }>;
}
