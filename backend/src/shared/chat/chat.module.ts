import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { EngagementChatMessage } from '../../database/entities/engagement-chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EngagementChatMessage])],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
