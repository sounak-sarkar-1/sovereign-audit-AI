import { ClarificationRequest } from './clarification-request.entity';
import { User } from './user.entity';
export declare class ClarificationResponse {
    id: string;
    clarificationRequestId: string;
    clarificationRequest: ClarificationRequest;
    respondedBy: string;
    user: User;
    message: string;
    createdAt: Date;
}
