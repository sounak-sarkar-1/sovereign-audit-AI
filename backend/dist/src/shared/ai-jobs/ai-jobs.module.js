"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiJobsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_jobs_controller_1 = require("./ai-jobs.controller");
const ai_jobs_service_1 = require("./ai-jobs.service");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const audit_report_entity_1 = require("../../database/entities/audit-report.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
const report_generation_worker_1 = require("./workers/report-generation.worker");
const files_module_1 = require("../files/files.module");
const notifications_module_1 = require("../notifications/notifications.module");
let AiJobsModule = class AiJobsModule {
};
exports.AiJobsModule = AiJobsModule;
exports.AiJobsModule = AiJobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ai_job_entity_1.AiJob,
                audit_report_entity_1.AuditReport,
                audit_entity_1.Audit,
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                exception_request_entity_1.ExceptionRequest
            ]),
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [ai_jobs_controller_1.AiJobsController],
        providers: [ai_jobs_service_1.AiJobsService, report_generation_worker_1.ReportGenerationWorker],
        exports: [ai_jobs_service_1.AiJobsService],
    })
], AiJobsModule);
//# sourceMappingURL=ai-jobs.module.js.map