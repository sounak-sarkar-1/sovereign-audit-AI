import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateMappingDto {
  @IsUUID()
  @IsNotEmpty()
  managerId: string;

  @IsUUID()
  @IsNotEmpty()
  targetId: string; // auditorId or clientId
}
