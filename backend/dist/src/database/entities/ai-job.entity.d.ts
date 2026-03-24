import { User } from './user.entity';
import { Audit } from './audit.entity';
export declare enum JobType {
    SCOPE_EXTRACTION = "scope_extraction",
    REPORT_GENERATION = "report_generation",
    NL_SEARCH = "nl_search"
}
export declare enum JobStatus {
    QUEUED = "queued",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class AiJob {
    id: string;
    jobType: JobType;
    status: JobStatus;
    inputPayload: any;
    outputPayload: any;
    errorMessage: string;
    auditId: string;
    audit: Audit;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
}
