import { IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

export class RespondToClarificationDto {
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  message: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  attachmentFileIds?: string[];
}
