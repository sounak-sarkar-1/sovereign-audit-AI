import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { InputMethod } from '../../../database/entities/audit-scope-line-item.entity';

export class UpdateScopeItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(InputMethod)
  @IsOptional()
  inputMethod?: InputMethod;

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
