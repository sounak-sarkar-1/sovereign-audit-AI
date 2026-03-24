"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAuditorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auditors_controller_1 = require("./auditors.controller");
const heatmap_service_1 = require("./heatmap.service");
const user_entity_1 = require("../../database/entities/user.entity");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
let ManagerAuditorsModule = class ManagerAuditorsModule {
};
exports.ManagerAuditorsModule = ManagerAuditorsModule;
exports.ManagerAuditorsModule = ManagerAuditorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                manager_auditor_mapping_entity_1.ManagerAuditorMapping,
                auditor_audit_assignment_entity_1.AuditorAuditAssignment,
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                audit_entity_1.Audit,
            ]),
        ],
        controllers: [auditors_controller_1.ManagerAuditorsController],
        providers: [heatmap_service_1.HeatmapService],
        exports: [heatmap_service_1.HeatmapService],
    })
], ManagerAuditorsModule);
//# sourceMappingURL=auditors.module.js.map