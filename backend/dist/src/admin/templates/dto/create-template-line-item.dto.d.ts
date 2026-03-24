import { InputMethod } from '../../../database/entities/audit-template-line-item.entity';
import { CreateTemplateOptionDto } from './create-template-option.dto';
export declare class CreateTemplateLineItemDto {
    name: string;
    description: string;
    inputMethod: InputMethod;
    isOptional?: boolean;
    displayOrder?: number;
    options?: CreateTemplateOptionDto[];
}
