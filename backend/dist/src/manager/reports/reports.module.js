"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_report_entity_1 = require("../../database/entities/audit-report.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const ai_jobs_module_1 = require("../../shared/ai-jobs/ai-jobs.module");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
let ManagerReportsModule = class ManagerReportsModule {
};
exports.ManagerReportsModule = ManagerReportsModule;
exports.ManagerReportsModule = ManagerReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([audit_entity_1.Audit, audit_report_entity_1.AuditReport, audit_scope_line_item_entity_1.AuditScopeLineItem, ai_job_entity_1.AiJob]),
            ai_jobs_module_1.AiJobsModule,
            notifications_module_1.NotificationsModule,
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [reports_controller_1.ManagerReportsController],
        providers: [reports_service_1.ManagerReportsService],
        exports: [reports_service_1.ManagerReportsService],
    })
], ManagerReportsModule);
//# sourceMappingURL=reports.module.js.map