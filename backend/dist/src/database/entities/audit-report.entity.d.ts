import { Audit } from './audit.entity';
import { UploadedFile } from './uploaded-file.entity';
export declare enum ReportStatus {
    DRAFT = "draft",
    SENT_FOR_CLIENT_REVIEW = "sent_for_client_review",
    FEEDBACK_SUBMITTED = "feedback_submitted",
    FINAL = "final"
}
export declare class AuditReport {
    id: string;
    auditId: string;
    audit: Audit;
    fileId: string;
    file: UploadedFile;
    version: number;
    status: ReportStatus;
    managerNotes: string;
    createdAt: Date;
    updatedAt: Date;
    feedbacks: ClientReportFeedback[];
}
import { ClientReportFeedback } from './client-report-feedback.entity';
