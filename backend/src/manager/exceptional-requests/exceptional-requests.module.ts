import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerExceptionalRequestsController } from './exceptional-requests.controller';
import { ManagerExceptionalRequestsService } from './exceptional-requests.service';
import { Audit } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Audit, ExceptionalActionRequest, User]),
    NotificationsModule,
    AuditTrailModule,
  ],
  controllers: [ManagerExceptionalRequestsController],
  providers: [ManagerExceptionalRequestsService],
  exports: [ManagerExceptionalRequestsService],
})
export class ManagerExceptionalRequestsModule {}
