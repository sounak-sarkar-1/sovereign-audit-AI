import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateClarificationDto {
  @IsUUID()
  clientId: string;

  @IsString()
  message: string;

  @IsUUID()
  @IsOptional()
  relatedExceptionId?: string;

  @IsUUID()
  auditId: string;
}
