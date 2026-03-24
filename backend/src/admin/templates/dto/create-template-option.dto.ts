import { IsString, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTemplateOptionDto {
  @IsString()
  @MaxLength(500)
  optionText: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
