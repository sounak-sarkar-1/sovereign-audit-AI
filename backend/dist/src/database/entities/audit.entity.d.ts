import { User } from './user.entity';
export declare enum AuditStatus {
    DRAFT = "draft",
    IN_PROGRESS = "in_progress",
    UNDER_MANAGER_REVIEW = "under_manager_review",
    PENDING_CLIENT_REVIEW = "pending_client_review",
    CLOSED = "closed",
    REOPENED = "reopened",
    DELETED = "deleted",
    ARCHIVED = "archived"
}
export declare class Audit {
    id: string;
    name: string;
    clientId: string;
    client: User;
    managerId: string;
    manager: User;
    status: AuditStatus;
    description: string;
    startDate: Date;
    expectedCompletionDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
