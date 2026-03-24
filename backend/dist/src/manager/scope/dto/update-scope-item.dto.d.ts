import { InputMethod } from '../../../database/entities/audit-scope-line-item.entity';
export declare class UpdateScopeItemDto {
    name?: string;
    description?: string;
    inputMethod?: InputMethod;
    isOptional?: boolean;
    displayOrder?: number;
    options?: string[];
}
