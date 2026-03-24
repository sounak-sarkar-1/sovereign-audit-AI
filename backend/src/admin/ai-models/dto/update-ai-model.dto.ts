import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAiModelDto } from './create-ai-model.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAiModelDto extends PartialType(OmitType(CreateAiModelDto, ['apiKey'] as const)) {
  @IsString()
  @IsOptional()
  apiKey?: string;
}
