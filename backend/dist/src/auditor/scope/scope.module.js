"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorScopeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scope_controller_1 = require("./scope.controller");
const scope_service_1 = require("./scope.service");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const line_item_response_entity_1 = require("../../database/entities/line-item-response.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const auditor_line_item_assignment_entity_1 = require("../../database/entities/auditor-line-item-assignment.entity");
const line_item_comment_entity_1 = require("../../database/entities/line-item-comment.entity");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
let AuditorScopeModule = class AuditorScopeModule {
};
exports.AuditorScopeModule = AuditorScopeModule;
exports.AuditorScopeModule = AuditorScopeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                line_item_response_entity_1.LineItemResponse,
                audit_business_unit_entity_1.AuditBusinessUnit,
                auditor_line_item_assignment_entity_1.AuditorLineItemAssignment,
                line_item_comment_entity_1.LineItemComment,
                uploaded_file_entity_1.UploadedFile,
            ]),
        ],
        controllers: [scope_controller_1.AuditorScopeController],
        providers: [scope_service_1.AuditorScopeService],
        exports: [scope_service_1.AuditorScopeService],
    })
], AuditorScopeModule);
//# sourceMappingURL=scope.module.js.map