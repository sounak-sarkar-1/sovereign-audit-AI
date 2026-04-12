import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputMethod } from '../../../database/entities/audit-template-line-item.entity';
import { CreateTemplateOptionDto } from './create-template-option.dto';

export class CreateTemplateLineItemDto {
  @IsString()
  @MaxLength(500)
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
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateOptionDto)
  options?: CreateTemplateOptionDto[];
}
