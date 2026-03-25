"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInsightsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const insights_controller_1 = require("./insights.controller");
const insights_service_1 = require("./insights.service");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
let ClientInsightsModule = class ClientInsightsModule {
};
exports.ClientInsightsModule = ClientInsightsModule;
exports.ClientInsightsModule = ClientInsightsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([audit_entity_1.Audit, audit_scope_line_item_entity_1.AuditScopeLineItem, exception_request_entity_1.ExceptionRequest])],
        controllers: [insights_controller_1.ClientInsightsController],
        providers: [insights_service_1.ClientInsightsService],
        exports: [insights_service_1.ClientInsightsService]
    })
], ClientInsightsModule);
//# sourceMappingURL=insights.module.js.map