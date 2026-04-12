import { IsString, IsOptional, MinLength } from 'class-validator';

export class ApproveExceptionDto {
  @IsString()
  @IsOptional()
  managerComment?: string;
}

export class RejectExceptionDto {
  @IsString()
  @MinLength(10, {
    message: 'Manager comment must be at least 10 characters long',
  })
  managerComment: string;
}
