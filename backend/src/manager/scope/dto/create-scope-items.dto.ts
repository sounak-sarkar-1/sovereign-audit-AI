import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputMethod } from '../../../database/entities/audit-scope-line-item.entity';

export class ScopeItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(InputMethod)
  inputMethod: InputMethod;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class CreateScopeItemsDto {
  @IsUUID()
  auditBusinessUnitId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScopeItemDto)
  items: ScopeItemDto[];
}
