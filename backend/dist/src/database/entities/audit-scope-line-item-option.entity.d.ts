import { AuditScopeLineItem } from './audit-scope-line-item.entity';
export declare class AuditScopeLineItemOption {
    id: string;
    lineItemId: string;
    lineItem: AuditScopeLineItem;
    optionText: string;
    displayOrder: number;
    createdAt: Date;
}
