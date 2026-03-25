import { Repository } from 'typeorm';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
export declare class ClientInsightsService {
    private readonly auditRepo;
    private readonly lineItemRepo;
    private readonly exceptionRepo;
    private readonly logger;
    constructor(auditRepo: Repository<Audit>, lineItemRepo: Repository<AuditScopeLineItem>, exceptionRepo: Repository<ExceptionRequest>);
    getGlobalInsights(clientId: string): Promise<{
        data: {
            auditsCount: number;
            complianceTrend: {
                auditId: string;
                name: string;
                date: Date;
                score: number;
            }[];
            riskByBu: {
                buName: any;
                rate: number;
            }[];
            recurringFindings: any[];
        };
    }>;
}
