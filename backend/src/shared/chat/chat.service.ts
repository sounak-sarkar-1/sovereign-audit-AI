import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngagementChatMessage } from '../../database/entities/engagement-chat-message.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(EngagementChatMessage)
    private readonly messageRepo: Repository<EngagementChatMessage>,
  ) {}

  async getMessages(auditId: string) {
    return this.messageRepo.find({
      where: { auditId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(auditId: string, user: User, content: string) {
    const message = this.messageRepo.create({
      auditId,
      authorId: user.id,
      content,
    });
    return this.messageRepo.save(message);
  }

  async markAsRead(auditId: string, userId: string) {
    await this.messageRepo.update(
      { auditId, authorId: userId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }
}
