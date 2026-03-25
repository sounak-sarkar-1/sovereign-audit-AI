import { Module } from '@nestjs/common';
import { ManagerChatController } from './chat.controller';
import { ChatModule as SharedChatModule } from '../../shared/chat/chat.module';

@Module({
  imports: [SharedChatModule],
  controllers: [ManagerChatController],
})
export class ManagerChatModule {}
