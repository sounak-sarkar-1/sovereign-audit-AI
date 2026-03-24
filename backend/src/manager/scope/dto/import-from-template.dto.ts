import { IsUUID, IsArray } from 'class-validator';

export class ImportFromTemplateDto {
  @IsArray()
  @IsUUID('4', { each: true })
  templateIds: string[];

  @IsUUID()
  auditBusinessUnitId: string;
}
