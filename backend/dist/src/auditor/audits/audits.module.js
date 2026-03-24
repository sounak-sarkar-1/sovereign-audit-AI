"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorAuditsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audits_controller_1 = require("./audits.controller");
const audits_service_1 = require("./audits.service");
const auditor_audit_assignment_entity_1 = require("../../database/entities/auditor-audit-assignment.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const line_item_response_entity_1 = require("../../database/entities/line-item-response.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const scope_module_1 = require("../scope/scope.module");
const exceptions_module_1 = require("../exceptions/exceptions.module");
let AuditorAuditsModule = class AuditorAuditsModule {
};
exports.AuditorAuditsModule = AuditorAuditsModule;
exports.AuditorAuditsModule = AuditorAuditsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                auditor_audit_assignment_entity_1.AuditorAuditAssignment,
                audit_entity_1.Audit,
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                line_item_response_entity_1.LineItemResponse,
                audit_business_unit_entity_1.AuditBusinessUnit,
            ]),
            scope_module_1.AuditorScopeModule,
            exceptions_module_1.AuditorExceptionsModule,
        ],
        controllers: [audits_controller_1.AuditorAuditsController],
        providers: [audits_service_1.AuditorAuditsService],
        exports: [audits_service_1.AuditorAuditsService],
    })
], AuditorAuditsModule);
//# sourceMappingURL=audits.module.js.map