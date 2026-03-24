import { IsString, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserStatus } from '../../../database/entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phone?: string;

  @IsEnum(UserStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: UserStatus;
}
