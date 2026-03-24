import { IsObject, IsString, IsOptional } from 'class-validator';

export class ColumnMappingDto {
  @IsString()
  nameColumn: string;

  @IsString()
  descriptionColumn: string;

  @IsString()
  @IsOptional()
  inputMethodColumn?: string;
}

export class ConfirmExcelImportDto {
  @IsObject()
  columnMapping: ColumnMappingDto;
}
