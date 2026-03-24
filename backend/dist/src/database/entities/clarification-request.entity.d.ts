import { Audit } from './audit.entity';
import { User } from './user.entity';
import { ExceptionRequest } from './exception-request.entity';
import { ClarificationResponse } from './clarification-response.entity';
export declare enum ClarificationStatus {
    PENDING = "pending",
    RESPONDED = "responded",
    CLOSED = "closed"
}
export declare class ClarificationRequest {
    id: string;
    auditId: string;
    audit: Audit;
    managerId: string;
    manager: User;
    clientId: string;
    client: User;
    message: string;
    status: ClarificationStatus;
    relatedExceptionId: string;
    relatedException: ExceptionRequest;
    responses: ClarificationResponse[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
