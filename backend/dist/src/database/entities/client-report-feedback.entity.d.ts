import { AuditReport } from './audit-report.entity';
import { User } from './user.entity';
export declare enum FeedbackStatus {
    ACCEPTED = "accepted",
    REQUIRES_REVISION = "requires_revision",
    NO_COMMENT = "no_comment"
}
export declare class ClientReportFeedback {
    id: string;
    reportId: string;
    report: AuditReport;
    sectionName: string;
    status: FeedbackStatus;
    comment: string;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
