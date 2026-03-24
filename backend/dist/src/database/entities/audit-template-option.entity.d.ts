import { AuditTemplateLineItem } from './audit-template-line-item.entity';
export declare class AuditTemplateOption {
    id: string;
    lineItemId: string;
    lineItem: AuditTemplateLineItem;
    optionText: string;
    displayOrder: number;
    createdAt: Date;
}
