import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
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
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
        AES_ENCRYPTION_KEY: Joi.string().length(32).required(),
        FRONTEND_URL: Joi.string().uri().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
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
