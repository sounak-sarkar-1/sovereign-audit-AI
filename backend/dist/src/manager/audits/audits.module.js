"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerAuditsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audits_controller_1 = require("./audits.controller");
const audits_service_1 = require("./audits.service");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const manager_client_mapping_entity_1 = require("../../database/entities/manager-client-mapping.entity");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const business_unit_entity_1 = require("../../database/entities/business-unit.entity");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
let ManagerAuditsModule = class ManagerAuditsModule {
};
exports.ManagerAuditsModule = ManagerAuditsModule;
exports.ManagerAuditsModule = ManagerAuditsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                audit_entity_1.Audit,
                audit_business_unit_entity_1.AuditBusinessUnit,
                user_entity_1.User,
                manager_client_mapping_entity_1.ManagerClientMapping,
                auditor_audit_assignment_entity_1.AuditorAuditAssignment,
                business_unit_entity_1.BusinessUnit,
                exceptional_action_request_entity_1.ExceptionalActionRequest
            ]),
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [audits_controller_1.ManagerAuditsController],
        providers: [audits_service_1.ManagerAuditsService],
        exports: [audits_service_1.ManagerAuditsService],
    })
], ManagerAuditsModule);
//# sourceMappingURL=audits.module.js.map