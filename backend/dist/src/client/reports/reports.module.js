"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const audit_report_entity_1 = require("../../database/entities/audit-report.entity");
const client_report_feedback_entity_1 = require("../../database/entities/client-report-feedback.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
const files_module_1 = require("../../shared/files/files.module");
let ClientReportsModule = class ClientReportsModule {
};
exports.ClientReportsModule = ClientReportsModule;
exports.ClientReportsModule = ClientReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([audit_report_entity_1.AuditReport, client_report_feedback_entity_1.ClientReportFeedback, audit_entity_1.Audit]),
            notifications_module_1.NotificationsModule,
            files_module_1.FilesModule,
        ],
        controllers: [reports_controller_1.ClientReportsController],
        providers: [reports_service_1.ClientReportsService],
        exports: [reports_service_1.ClientReportsService],
    })
], ClientReportsModule);
//# sourceMappingURL=reports.module.js.map