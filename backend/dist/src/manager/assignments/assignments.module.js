"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAssignmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const assignments_controller_1 = require("./assignments.controller");
const assignments_service_1 = require("./assignments.service");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const auditor_line_item_assignment_entity_1 = require("../../database/entities/auditor-line-item-assignment.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
let ManagerAssignmentsModule = class ManagerAssignmentsModule {
};
exports.ManagerAssignmentsModule = ManagerAssignmentsModule;
exports.ManagerAssignmentsModule = ManagerAssignmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                auditor_audit_assignment_entity_1.AuditorAuditAssignment,
                auditor_line_item_assignment_entity_1.AuditorLineItemAssignment,
                audit_entity_1.Audit,
                audit_business_unit_entity_1.AuditBusinessUnit,
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                manager_auditor_mapping_entity_1.ManagerAuditorMapping,
            ]),
            audit_trail_module_1.AuditTrailModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [assignments_controller_1.ManagerAssignmentsController],
        providers: [assignments_service_1.ManagerAssignmentsService],
        exports: [assignments_service_1.ManagerAssignmentsService],
    })
], ManagerAssignmentsModule);
//# sourceMappingURL=assignments.module.js.map