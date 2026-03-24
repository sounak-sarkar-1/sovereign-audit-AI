import { IsString, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTemplateLineItemDto } from './create-template-line-item.dto';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateLineItemDto)
  lineItems: CreateTemplateLineItemDto[];
}
