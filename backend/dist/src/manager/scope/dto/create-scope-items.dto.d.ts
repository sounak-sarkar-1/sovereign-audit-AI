import { InputMethod } from '../../../database/entities/audit-scope-line-item.entity';
export declare class ScopeItemDto {
    name: string;
    description: string;
    inputMethod: InputMethod;
    isOptional?: boolean;
    displayOrder?: number;
    options?: string[];
}
export declare class CreateScopeItemsDto {
    auditBusinessUnitId: string;
    items: ScopeItemDto[];
}
