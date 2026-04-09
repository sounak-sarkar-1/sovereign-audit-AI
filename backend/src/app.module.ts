import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { AuditTrailModule } from './shared/audit-trail/audit-trail.module';

// Admin modules
import { AdminAiModelsModule } from './admin/ai-models/ai-models.module';
import { AdminAuditsModule } from './admin/audits/audits.module';
import { AdminBusinessUnitsModule } from './admin/business-units/business-units.module';
import { AdminExceptionalRequestsModule } from './admin/exceptional-requests/exceptional-requests.module';
import { AdminMappingsModule } from './admin/mappings/mappings.module';
import { TemplatesModule as AdminTemplatesModule } from './admin/templates/templates.module';
import { AdminUsersModule } from './admin/users/users.module';
import { AdminSummaryModule } from './admin/summary/summary.module';

// Auditor modules
import { AuditorAuditsModule } from './auditor/audits/audits.module';
import { AuditorExceptionsModule } from './auditor/exceptions/exceptions.module';
import { AuditorScopeModule } from './auditor/scope/scope.module';
import { AuditorSearchModule } from './auditor/search/search.module';
import { AuditorChatModule } from './auditor/chat/chat.module';
import { ChatModule } from './shared/chat/chat.module';

// Client modules
import { ClientAuditsModule } from './client/audits/audits.module';
import { ClientClarificationsModule } from './client/clarifications/clarifications.module';
import { ClientInsightsModule } from './client/insights/insights.module';
import { ClientReportsModule } from './client/reports/reports.module';
import { ClientSearchModule } from './client/search/search.module';
import { ClientCorrectiveActionsModule } from './client/corrective-actions/corrective-actions.module';

// Manager modules
import { ManagerAssignmentsModule } from './manager/assignments/assignments.module';
import { ManagerAuditsModule } from './manager/audits/audits.module';
import { ManagerAuditorsModule } from './manager/auditors/auditors.module';
import { ManagerChatModule } from './manager/chat/chat.module';
import { ManagerClarificationsModule } from './manager/clarifications/clarifications.module';
import { ManagerExceptionsModule } from './manager/exceptions/exceptions.module';
import { ManagerReportsModule } from './manager/reports/reports.module';
import { ManagerScopeModule } from './manager/scope/scope.module';
import { ManagerExceptionalRequestsModule } from './manager/exceptional-requests/exceptional-requests.module';
import { ManagerSettingsModule } from './manager/settings/settings.module';

// Shared modules
import { AiJobsModule } from './shared/ai-jobs/ai-jobs.module';
import { FilesModule } from './shared/files/files.module';
import { NotificationsModule } from './shared/notifications/notifications.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    TenantModule,
    AuditTrailModule,
    NotificationsModule,
    FilesModule,
    AiJobsModule,
    
    // Admin
    AdminAiModelsModule,
    AdminAuditsModule,
    AdminBusinessUnitsModule,
    AdminExceptionalRequestsModule,
    AdminMappingsModule,
    AdminTemplatesModule,
    AdminUsersModule,
    AdminSummaryModule,
    
    // Auditor
    AuditorAuditsModule,
    AuditorExceptionsModule,
    AuditorScopeModule,
    AuditorSearchModule,
    AuditorChatModule,
    ChatModule,
    
    // Client
    ClientAuditsModule,
    ClientClarificationsModule,
    ClientInsightsModule,
    ClientReportsModule,
    ClientSearchModule,
    ClientCorrectiveActionsModule,
    
    // Manager
    ManagerAssignmentsModule,
    ManagerAuditorsModule,
    ManagerChatModule,
    ManagerAuditsModule,
    ManagerClarificationsModule,
    ManagerExceptionsModule,
    ManagerReportsModule,
    ManagerScopeModule,
    ManagerExceptionalRequestsModule,
    ManagerSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
