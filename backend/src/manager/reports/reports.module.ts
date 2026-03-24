import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerReportsController } from './reports.controller';
import { ManagerReportsService } from './reports.service';
import { Audit } from '../../database/entities/audit.entity';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AiJob } from '../../database/entities/ai-job.entity';
import { AiJobsModule } from '../../shared/ai-jobs/ai-jobs.module';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Audit, AuditReport, AuditScopeLineItem, AiJob]),
    AiJobsModule,
    NotificationsModule,
    AuditTrailModule,
  ],
  controllers: [ManagerReportsController],
  providers: [ManagerReportsService],
  exports: [ManagerReportsService],
})
export class ManagerReportsModule {}