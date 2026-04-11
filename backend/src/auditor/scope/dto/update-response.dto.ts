import { IsString, IsOptional, IsUUID, IsBoolean, ValidateIf } from 'class-validator';
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
  @IsString()
  comment?: string;

  @IsBoolean()
  isDraft: boolean;

  @IsOptional()
  @IsUUID('4', { each: true })
  evidenceFileIds?: string[];
}
