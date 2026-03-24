import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
