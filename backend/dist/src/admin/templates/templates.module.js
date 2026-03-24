"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const templates_service_1 = require("./templates.service");
const templates_controller_1 = require("./templates.controller");
const audit_template_entity_1 = require("../../database/entities/audit-template.entity");
const audit_template_line_item_entity_1 = require("../../database/entities/audit-template-line-item.entity");
const audit_template_option_entity_1 = require("../../database/entities/audit-template-option.entity");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([audit_template_entity_1.AuditTemplate, audit_template_line_item_entity_1.AuditTemplateLineItem, audit_template_option_entity_1.AuditTemplateOption]),
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [templates_controller_1.TemplatesController],
        providers: [templates_service_1.TemplatesService],
        exports: [templates_service_1.TemplatesService],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map