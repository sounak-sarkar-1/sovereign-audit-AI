import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerScopeController } from './scope.controller';
import { ManagerScopeService } from './scope.service';
import { ScopeExtractionWorker } from './scope-extraction.worker';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AuditScopeLineItemOption } from '../../database/entities/audit-scope-line-item-option.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { AuditTemplateLineItem } from '../../database/entities/audit-template-line-item.entity';
import { AiJob } from '../../database/entities/ai-job.entity';
import { ImportSession } from '../../database/entities/import-session.entity';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { Audit } from '../../database/entities/audit.entity';
import { FilesModule } from '../../shared/files/files.module';
import { AiJobsModule } from '../../shared/ai-jobs/ai-jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditScopeLineItem,
      AuditScopeLineItemOption,
      AuditBusinessUnit,
      AuditTemplate,
      AuditTemplateLineItem,
      AiJob,
      ImportSession,
      UploadedFile,
      Audit,
    ]),
    FilesModule,
    AiJobsModule,
  ],
  controllers: [ManagerScopeController],
  providers: [ManagerScopeService, ScopeExtractionWorker],
  exports: [ManagerScopeService],
})
export class ManagerScopeModule {}
