import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientClarificationsController } from './clarifications.controller';
import { ClientClarificationsService } from './clarifications.service';
import { ClarificationRequest } from '../../database/entities/clarification-request.entity';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClarificationRequest,
      ClarificationResponse,
      UploadedFile,
    ]),
    NotificationsModule,
  ],
  controllers: [ClientClarificationsController],
  providers: [ClientClarificationsService],
  exports: [ClientClarificationsService],
})
export class ClientClarificationsModule {}
