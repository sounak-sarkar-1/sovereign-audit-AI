import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditorExceptionsController } from './exceptions.controller';
import { AuditorExceptionsService } from './exceptions.service';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExceptionRequest,
      AuditScopeLineItem,
      Audit,
      UploadedFile,
      ExceptionComment,
      AuditBusinessUnit,
    ]),
    NotificationsModule,
    AuditTrailModule,
  ],
  controllers: [AuditorExceptionsController],
  providers: [AuditorExceptionsService],
  exports: [AuditorExceptionsService],
})
export class AuditorExceptionsModule {}