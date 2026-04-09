"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const tenant_module_1 = require("./tenant/tenant.module");
const audit_trail_module_1 = require("./shared/audit-trail/audit-trail.module");
const ai_models_module_1 = require("./admin/ai-models/ai-models.module");
const audits_module_1 = require("./admin/audits/audits.module");
const business_units_module_1 = require("./admin/business-units/business-units.module");
const exceptional_requests_module_1 = require("./admin/exceptional-requests/exceptional-requests.module");
const mappings_module_1 = require("./admin/mappings/mappings.module");
const templates_module_1 = require("./admin/templates/templates.module");
const users_module_1 = require("./admin/users/users.module");
const summary_module_1 = require("./admin/summary/summary.module");
const audits_module_2 = require("./auditor/audits/audits.module");
const exceptions_module_1 = require("./auditor/exceptions/exceptions.module");
const scope_module_1 = require("./auditor/scope/scope.module");
const search_module_1 = require("./auditor/search/search.module");
const chat_module_1 = require("./auditor/chat/chat.module");
const chat_module_2 = require("./shared/chat/chat.module");
const audits_module_3 = require("./client/audits/audits.module");
const clarifications_module_1 = require("./client/clarifications/clarifications.module");
const insights_module_1 = require("./client/insights/insights.module");
const reports_module_1 = require("./client/reports/reports.module");
const search_module_2 = require("./client/search/search.module");
const corrective_actions_module_1 = require("./client/corrective-actions/corrective-actions.module");
const assignments_module_1 = require("./manager/assignments/assignments.module");
const audits_module_4 = require("./manager/audits/audits.module");
const auditors_module_1 = require("./manager/auditors/auditors.module");
const chat_module_3 = require("./manager/chat/chat.module");
const clarifications_module_2 = require("./manager/clarifications/clarifications.module");
const exceptions_module_2 = require("./manager/exceptions/exceptions.module");
const reports_module_2 = require("./manager/reports/reports.module");
const scope_module_2 = require("./manager/scope/scope.module");
const exceptional_requests_module_2 = require("./manager/exceptional-requests/exceptional-requests.module");
const settings_module_1 = require("./manager/settings/settings.module");
const ai_jobs_module_1 = require("./shared/ai-jobs/ai-jobs.module");
const files_module_1 = require("./shared/files/files.module");
const notifications_module_1 = require("./shared/notifications/notifications.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            audit_trail_module_1.AuditTrailModule,
            notifications_module_1.NotificationsModule,
            files_module_1.FilesModule,
            ai_jobs_module_1.AiJobsModule,
            ai_models_module_1.AdminAiModelsModule,
            audits_module_1.AdminAuditsModule,
            business_units_module_1.AdminBusinessUnitsModule,
            exceptional_requests_module_1.AdminExceptionalRequestsModule,
            mappings_module_1.AdminMappingsModule,
            templates_module_1.TemplatesModule,
            users_module_1.AdminUsersModule,
            summary_module_1.AdminSummaryModule,
            audits_module_2.AuditorAuditsModule,
            exceptions_module_1.AuditorExceptionsModule,
            scope_module_1.AuditorScopeModule,
            search_module_1.AuditorSearchModule,
            chat_module_1.AuditorChatModule,
            chat_module_2.ChatModule,
            audits_module_3.ClientAuditsModule,
            clarifications_module_1.ClientClarificationsModule,
            insights_module_1.ClientInsightsModule,
            reports_module_1.ClientReportsModule,
            search_module_2.ClientSearchModule,
            corrective_actions_module_1.ClientCorrectiveActionsModule,
            assignments_module_1.ManagerAssignmentsModule,
            auditors_module_1.ManagerAuditorsModule,
            chat_module_3.ManagerChatModule,
            audits_module_4.ManagerAuditsModule,
            clarifications_module_2.ManagerClarificationsModule,
            exceptions_module_2.ManagerExceptionsModule,
            reports_module_2.ManagerReportsModule,
            scope_module_2.ManagerScopeModule,
            exceptional_requests_module_2.ManagerExceptionalRequestsModule,
            settings_module_1.ManagerSettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map