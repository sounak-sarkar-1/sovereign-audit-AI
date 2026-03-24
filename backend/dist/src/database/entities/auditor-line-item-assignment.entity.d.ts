import { User } from './user.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
export declare class AuditorLineItemAssignment {
    id: string;
    auditScopeLineItemId: string;
    auditScopeLineItem: AuditScopeLineItem;
    auditorId: string;
    auditor: User;
    createdAt: Date;
    deletedAt: Date;
}
