import { Audit } from './audit.entity';
import { User } from './user.entity';
import { UploadedFile } from './uploaded-file.entity';
export declare enum ExceptionalActionType {
    DELETE = "delete",
    REOPEN = "reopen"
}
export declare enum ExceptionalRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ExceptionalActionRequest {
    id: string;
    auditId: string;
    audit: Audit;
    actionType: ExceptionalActionType;
    justification: string;
    status: ExceptionalRequestStatus;
    requestedById: string;
    requester: User;
    resolvedAt: Date;
    resolvedById: string;
    resolver: User;
    evidenceFileId: string;
    evidenceFile: UploadedFile;
    adminComment: string;
    createdAt: Date;
    updatedAt: Date;
}
