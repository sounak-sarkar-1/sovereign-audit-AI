import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  ValidateIf,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateResponseDto {
  @IsOptional()
  @IsString()
  responseText?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.selectedOptionId !== '' && o.selectedOptionId !== null)
  @IsUUID()
  selectedOptionId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  complianceScore?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsBoolean()
  isDraft: boolean;

  @IsOptional()
  @IsUUID('4', { each: true })
  evidenceFileIds?: string[];
}
