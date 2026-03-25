import { ChatService } from '../../shared/chat/chat.service';
import { User } from '../../database/entities/user.entity';
export declare class AuditorChatController {
    private readonly service;
    constructor(service: ChatService);
    getMessages(auditId: string): Promise<import("../../database/entities/engagement-chat-message.entity").EngagementChatMessage[]>;
    sendMessage(auditId: string, content: string, user: User): Promise<import("../../database/entities/engagement-chat-message.entity").EngagementChatMessage>;
    markAsRead(auditId: string, user: User): Promise<{
        success: boolean;
    }>;
}
