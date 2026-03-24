import { CreateTemplateLineItemDto } from './create-template-line-item.dto';
export declare class CreateTemplateDto {
    name: string;
    description?: string;
    lineItems: CreateTemplateLineItemDto[];
}
