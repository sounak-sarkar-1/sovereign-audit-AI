import { Audit } from './audit.entity';
import { User } from './user.entity';
export declare class EngagementChatMessage {
    id: string;
    auditId: string;
    audit: Audit;
    authorId: string;
    author: User;
    content: string;
    isRead: boolean;
    createdAt: Date;
}
