"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerScopeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scope_controller_1 = require("./scope.controller");
const scope_service_1 = require("./scope.service");
const scope_extraction_worker_1 = require("./scope-extraction.worker");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_scope_line_item_option_entity_1 = require("../../database/entities/audit-scope-line-item-option.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const audit_template_entity_1 = require("../../database/entities/audit-template.entity");
const audit_template_line_item_entity_1 = require("../../database/entities/audit-template-line-item.entity");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const import_session_entity_1 = require("../../database/entities/import-session.entity");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const files_module_1 = require("../../shared/files/files.module");
const ai_jobs_module_1 = require("../../shared/ai-jobs/ai-jobs.module");
let ManagerScopeModule = class ManagerScopeModule {
};
exports.ManagerScopeModule = ManagerScopeModule;
exports.ManagerScopeModule = ManagerScopeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                audit_scope_line_item_option_entity_1.AuditScopeLineItemOption,
                audit_business_unit_entity_1.AuditBusinessUnit,
                audit_template_entity_1.AuditTemplate,
                audit_template_line_item_entity_1.AuditTemplateLineItem,
                ai_job_entity_1.AiJob,
                import_session_entity_1.ImportSession,
                uploaded_file_entity_1.UploadedFile,
                audit_entity_1.Audit,
            ]),
            files_module_1.FilesModule,
            ai_jobs_module_1.AiJobsModule,
        ],
        controllers: [scope_controller_1.ManagerScopeController],
        providers: [scope_service_1.ManagerScopeService, scope_extraction_worker_1.ScopeExtractionWorker],
        exports: [scope_service_1.ManagerScopeService],
    })
], ManagerScopeModule);
//# sourceMappingURL=scope.module.js.map