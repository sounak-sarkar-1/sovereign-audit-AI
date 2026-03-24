import { User } from './user.entity';
export declare enum FileEntityType {
    LINE_ITEM_EVIDENCE = "line_item_evidence",
    EXCEPTION_EVIDENCE = "exception_evidence",
    SOP_DOCUMENT = "sop_document",
    AUDIT_REPORT = "audit_report",
    EXCEPTIONAL_ACTION_EVIDENCE = "exceptional_action_evidence",
    CLARIFICATION_ATTACHMENT = "clarification_attachment"
}
export declare class UploadedFile {
    id: string;
    originalFilename: string;
    storedFilename: string;
    filePath: string;
    mimeType: string;
    fileSizeBytes: number;
    uploadedBy: string;
    uploader: User;
    entityType: FileEntityType;
    entityId: string;
    createdAt: Date;
    deletedAt: Date;
}
