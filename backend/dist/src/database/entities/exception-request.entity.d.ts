import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';
export declare enum ExceptionStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ExceptionRequest {
    id: string;
    auditScopeLineItemId: string;
    auditScopeLineItem: AuditScopeLineItem;
    auditorId: string;
    auditor: User;
    managerId: string;
    manager: User;
    justification: string;
    status: ExceptionStatus;
    managerComment: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date;
}
