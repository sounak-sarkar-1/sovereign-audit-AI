import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignLineItemDto {
  @IsUUID()
  @IsNotEmpty()
  auditorId: string;

  @IsUUID()
  @IsNotEmpty()
  lineItemId: string;
}
