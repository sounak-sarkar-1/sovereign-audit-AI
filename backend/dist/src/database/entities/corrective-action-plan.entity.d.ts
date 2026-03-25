import { Audit } from './audit.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';
export declare enum CorrectiveActionStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    VERIFIED = "verified"
}
export declare enum CorrectiveActionPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class CorrectiveActionPlan {
    id: string;
    auditId: string;
    audit: Audit;
    lineItemId: string;
    lineItem: AuditScopeLineItem;
    title: string;
    description: string;
    status: CorrectiveActionStatus;
    priority: CorrectiveActionPriority;
    dueDate: Date;
    completionDate: Date;
    createdBy: string;
    creator: User;
    assignedTo: string;
    assignee: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
