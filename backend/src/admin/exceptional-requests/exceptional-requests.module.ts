import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminExceptionalRequestsController } from './exceptional-requests.controller';
import { AdminExceptionalRequestsService } from './exceptional-requests.service';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { FilesModule } from '../../shared/files/files.module';
import { NotificationsModule } from '../../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExceptionalActionRequest, Audit, AuditTrailLog]),
    FilesModule,
    NotificationsModule,
  ],
  controllers: [AdminExceptionalRequestsController],
  providers: [AdminExceptionalRequestsService],
  exports: [AdminExceptionalRequestsService],
})
export class AdminExceptionalRequestsModule {}
