import { IsString, MinLength, IsOptional } from 'class-validator';

export class RespondToClarificationDto {
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  message: string;

  @IsString()
  @IsOptional()
  attachmentFileId?: string;
}
