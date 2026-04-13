import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsNumber,
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

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  weightage?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}
