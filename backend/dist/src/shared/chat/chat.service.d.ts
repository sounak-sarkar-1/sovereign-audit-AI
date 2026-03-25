import { Repository } from 'typeorm';
import { EngagementChatMessage } from '../../database/entities/engagement-chat-message.entity';
import { User } from '../../database/entities/user.entity';
export declare class ChatService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<EngagementChatMessage>);
    getMessages(auditId: string): Promise<EngagementChatMessage[]>;
    sendMessage(auditId: string, user: User, content: string): Promise<EngagementChatMessage>;
    markAsRead(auditId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
