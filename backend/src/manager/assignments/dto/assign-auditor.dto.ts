import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignAuditorDto {
  @IsUUID()
  @IsNotEmpty()
  auditorId: string;

  @IsUUID()
  @IsNotEmpty()
  auditBusinessUnitId: string;
}
