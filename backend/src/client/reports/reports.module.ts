import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientReportsController } from './reports.controller';
import { ClientReportsService } from './reports.service';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { ClientReportFeedback } from '../../database/entities/client-report-feedback.entity';
import { Audit } from '../../database/entities/audit.entity';
import { NotificationsModule } from '../../shared/notifications/notifications.module';
import { FilesModule } from '../../shared/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditReport, ClientReportFeedback, Audit]),
    NotificationsModule,
    FilesModule,
  ],
  controllers: [ClientReportsController],
  providers: [ClientReportsService],
  exports: [ClientReportsService],
})
export class ClientReportsModule {}