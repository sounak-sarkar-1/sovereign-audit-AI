import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiJobsController } from './ai-jobs.controller';
import { AiJobsService } from './ai-jobs.service';
import { AiJob } from '../../database/entities/ai-job.entity';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { ReportGenerationWorker } from './workers/report-generation.worker';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiJob,
      AuditReport,
      Audit,
      AuditScopeLineItem,
      ExceptionRequest,
    ]),
    FilesModule,
    NotificationsModule,
  ],
  controllers: [AiJobsController],
  providers: [AiJobsService, ReportGenerationWorker],
  exports: [AiJobsService],
})
export class AiJobsModule {}
