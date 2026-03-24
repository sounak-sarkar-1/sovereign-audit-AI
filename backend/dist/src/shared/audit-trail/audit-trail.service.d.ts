import { Repository } from 'typeorm';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
export declare enum AuditAction {
    USER_CREATED = "USER_CREATED",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    AUDIT_CREATED = "AUDIT_CREATED",
    AUDIT_STARTED = "AUDIT_STARTED",
    SCOPE_DEFINED = "SCOPE_DEFINED",
    AUDITOR_ASSIGNED = "AUDITOR_ASSIGNED",
    RESPONSE_SUBMITTED = "RESPONSE_SUBMITTED",
    EXCEPTION_RAISED = "EXCEPTION_RAISED",
    EXCEPTION_APPROVED = "EXCEPTION_APPROVED",
    EXCEPTION_REJECTED = "EXCEPTION_REJECTED",
    REPORT_GENERATED = "REPORT_GENERATED",
    REPORT_SENT_TO_CLIENT = "REPORT_SENT_TO_CLIENT",
    CLIENT_FEEDBACK_SUBMITTED = "CLIENT_FEEDBACK_SUBMITTED",
    AUDIT_CLOSED = "AUDIT_CLOSED",
    AUDIT_DELETED = "AUDIT_DELETED",
    AUDIT_REOPENED = "AUDIT_REOPENED",
    EXCEPTIONAL_REQUEST_RAISED = "EXCEPTIONAL_REQUEST_RAISED",
    EXCEPTIONAL_REQUEST_APPROVED = "EXCEPTIONAL_REQUEST_APPROVED",
    EXCEPTIONAL_REQUEST_REJECTED = "EXCEPTIONAL_REQUEST_REJECTED",
    MAPPING_CREATED = "MAPPING_CREATED",
    MAPPING_DELETED = "MAPPING_DELETED",
    TEMPLATE_CREATED = "TEMPLATE_CREATED",
    TEMPLATE_UPDATED = "TEMPLATE_UPDATED",
    TEMPLATE_DELETED = "TEMPLATE_DELETED",
    CLARIFICATION_CLOSED = "CLARIFICATION_CLOSED"
}
interface LogEntry {
    actorId?: string;
    actorRole?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
}
export declare class AuditTrailService {
    private readonly repository;
    private readonly logger;
    constructor(repository: Repository<AuditTrailLog>);
    log(entry: LogEntry): Promise<void>;
}
export {};
