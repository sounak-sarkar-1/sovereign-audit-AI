import { Repository } from 'typeorm';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { User } from '../../database/entities/user.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
export declare class AuditorAuditsService {
    private readonly assignmentRepo;
    private readonly auditRepo;
    private readonly lineItemRepo;
    private readonly auditBURepo;
    private readonly logger;
    constructor(assignmentRepo: Repository<AuditorAuditAssignment>, auditRepo: Repository<Audit>, lineItemRepo: Repository<AuditScopeLineItem>, auditBURepo: Repository<AuditBusinessUnit>);
    findAll(user: User): Promise<{
        endDate: Date;
        stats: {
            totalItems: number;
            submittedItems: number;
            draftItems: number;
            pendingExceptions: number;
            completionPercent: number;
        };
        id: string;
        name: string;
        clientId: string;
        client: User;
        managerId: string;
        manager: User;
        status: import("../../database/entities/audit.entity").AuditStatus;
        description: string;
        startDate: Date;
        expectedCompletionDate: Date;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }[]>;
    findOne(auditId: string, user: User): Promise<{
        clientName: string;
        endDate: Date;
        stats: {
            totalItems: number;
            submittedItems: number;
            pendingExceptions: number;
            completionPercent: number;
            buStats: {
                id: string;
                name: string;
                coAuditorCompletion: number;
            }[];
        };
        id: string;
        name: string;
        clientId: string;
        client: User;
        managerId: string;
        manager: User;
        status: import("../../database/entities/audit.entity").AuditStatus;
        description: string;
        startDate: Date;
        expectedCompletionDate: Date;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
}
