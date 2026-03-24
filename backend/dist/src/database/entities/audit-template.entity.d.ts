import { User } from './user.entity';
import { AuditTemplateLineItem } from './audit-template-line-item.entity';
export declare class AuditTemplate {
    id: string;
    name: string;
    description: string;
    createdById: string;
    createdBy: User;
    lineItems: AuditTemplateLineItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
