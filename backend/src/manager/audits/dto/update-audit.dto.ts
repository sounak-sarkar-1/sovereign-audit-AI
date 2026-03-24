import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditDto } from './create-audit.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateAuditDto extends PartialType(CreateAuditDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
