import { FeedbackStatus } from '../../../database/entities/client-report-feedback.entity';
export declare class SectionFeedbackDto {
    sectionName: string;
    status: FeedbackStatus;
    comment?: string;
}
export declare class SubmitReportFeedbackDto {
    feedback: SectionFeedbackDto[];
}
