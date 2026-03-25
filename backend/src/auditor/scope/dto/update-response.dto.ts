import { IsString, IsOptional, IsUUID, IsBoolean, MinLength } from 'class-validator';

export class UpdateResponseDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  responseText?: string;

  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsBoolean()
  isDraft: boolean;

  @IsOptional()
  @IsUUID('4', { each: true })
  evidenceFileIds?: string[];
}
