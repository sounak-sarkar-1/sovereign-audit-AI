import { Audit } from './audit.entity';
import { AuditBusinessUnit } from './audit-business-unit.entity';
import { AuditScopeLineItemOption } from './audit-scope-line-item-option.entity';
import { LineItemResponse } from './line-item-response.entity';
import { AuditorLineItemAssignment } from './auditor-line-item-assignment.entity';
export declare enum InputMethod {
    FREE_TEXT = "free_text",
    MULTIPLE_CHOICE = "multiple_choice"
}
export declare enum LineItemSource {
    MANUAL = "manual",
    AI_EXTRACTED = "ai_extracted",
    EXCEL_IMPORTED = "excel_imported",
    TEMPLATE = "template"
}
export declare enum LineItemStatus {
    NOT_STARTED = "not_started",
    DRAFT_SAVED = "draft_saved",
    SUBMITTED = "submitted",
    EXCEPTION_PENDING = "exception_pending",
    EXCEPTION_APPROVED = "exception_approved",
    EXCEPTION_REJECTED = "exception_rejected",
    RETURNED = "returned"
}
export declare class AuditScopeLineItem {
    id: string;
    auditId: string;
    audit: Audit;
    auditBusinessUnitId: string;
    auditBusinessUnit: AuditBusinessUnit;
    name: string;
    description: string;
    inputMethod: InputMethod;
    isOptional: boolean;
    displayOrder: number;
    source: LineItemSource;
    status: LineItemStatus;
    options: AuditScopeLineItemOption[];
    responses: LineItemResponse[];
    assignments: AuditorLineItemAssignment[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
