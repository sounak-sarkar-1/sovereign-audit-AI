import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { AiModelType } from '../../../database/entities/ai-model.entity';

export class CreateAiModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AiModelType)
  modelType: AiModelType;

  @IsUrl()
  @IsNotEmpty()
  endpointUrl: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
