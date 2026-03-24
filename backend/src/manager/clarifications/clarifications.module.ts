import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerClarificationsController } from './clarifications.controller';
import { ManagerClarificationsService } from './clarifications.service';
import { ClarificationRequest } from '../../database/entities/clarification-request.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClarificationRequest, ExceptionRequest]),
    NotificationsModule,
  ],
  controllers: [ManagerClarificationsController],
  providers: [ManagerClarificationsService],
  exports: [ManagerClarificationsService],
})
export class ManagerClarificationsModule {}