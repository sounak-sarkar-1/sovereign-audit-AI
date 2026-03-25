import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerExceptionsController } from './exceptions.controller';
import { ManagerExceptionsService } from './exceptions.service';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExceptionRequest, AuditScopeLineItem, ExceptionComment]),
    NotificationsModule,
    AuditTrailModule,
  ],
  controllers: [ManagerExceptionsController],
  providers: [ManagerExceptionsService],
  exports: [ManagerExceptionsService],
})
export class ManagerExceptionsModule {}