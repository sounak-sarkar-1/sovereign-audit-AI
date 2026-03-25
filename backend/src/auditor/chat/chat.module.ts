import { Module } from '@nestjs/common';
import { AuditorChatController } from './chat.controller';
import { ChatModule as SharedChatModule } from '../../shared/chat/chat.module';

@Module({
  imports: [SharedChatModule],
  controllers: [AuditorChatController],
})
export class AuditorChatModule {}
