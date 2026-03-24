import { AuditTemplate } from './audit-template.entity';
import { AuditTemplateOption } from './audit-template-option.entity';
export declare enum InputMethod {
    FREE_TEXT = "free_text",
    MULTIPLE_CHOICE = "multiple_choice"
}
export declare class AuditTemplateLineItem {
    id: string;
    templateId: string;
    template: AuditTemplate;
    name: string;
    description: string;
    inputMethod: InputMethod;
    isOptional: boolean;
    displayOrder: number;
    options: AuditTemplateOption[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
