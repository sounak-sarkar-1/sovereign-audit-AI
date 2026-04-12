import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateExceptionDto {
  @IsUUID()
  @IsNotEmpty()
  lineItemId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  justification: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  evidenceFileIds?: string[];
}
