import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';

export class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  businessUnitIds: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  expectedCompletionDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  previousAuditId?: string;
}
