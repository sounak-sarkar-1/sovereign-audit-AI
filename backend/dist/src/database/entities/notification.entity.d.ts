import { User } from './user.entity';
export declare enum NotificationType {
    USER_CREATED = "user_created",
    AUDIT_ASSIGNED = "audit_assigned",
    EXCEPTION_RAISED = "exception_raised",
    EXCEPTION_APPROVED = "exception_approved",
    EXCEPTION_REJECTED = "exception_rejected",
    REPORT_READY_TO_GENERATE = "report_ready_to_generate",
    REPORT_SENT_TO_CLIENT = "report_sent_to_client",
    CLIENT_FEEDBACK_RECEIVED = "client_feedback_received",
    CLARIFICATION_REQUEST = "clarification_request",
    CLARIFICATION_RESPONDED = "clarification_responded",
    EXCEPTIONAL_REQUEST_RAISED = "exceptional_request_raised",
    EXCEPTIONAL_REQUEST_RESOLVED = "exceptional_request_resolved",
    AUDIT_CLOSED = "audit_closed",
    REPORT_READY = "report_ready"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    relatedEntityType: string;
    relatedEntityId: string;
    metadata: any;
    createdAt: Date;
}
