import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeedbackStatus } from '../../../database/entities/client-report-feedback.entity';

export class SectionFeedbackDto {
  @IsString()
  @IsNotEmpty()
  sectionName: string;

  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class SubmitReportFeedbackDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionFeedbackDto)
  feedback: SectionFeedbackDto[];
}
