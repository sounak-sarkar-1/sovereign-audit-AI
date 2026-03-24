import { User } from './user.entity';
import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { AuditScopeLineItemOption } from './audit-scope-line-item-option.entity';
export declare class LineItemResponse {
    id: string;
    auditScopeLineItemId: string;
    lineItem: AuditScopeLineItem;
    auditorId: string;
    auditor: User;
    responseText: string;
    selectedOptionId: string;
    selectedOption: AuditScopeLineItemOption;
    comment: string;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
