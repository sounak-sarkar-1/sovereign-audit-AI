"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBusinessUnitsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const business_units_controller_1 = require("./business-units.controller");
const business_units_service_1 = require("./business-units.service");
const business_unit_entity_1 = require("../../database/entities/business-unit.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
let AdminBusinessUnitsModule = class AdminBusinessUnitsModule {
};
exports.AdminBusinessUnitsModule = AdminBusinessUnitsModule;
exports.AdminBusinessUnitsModule = AdminBusinessUnitsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([business_unit_entity_1.BusinessUnit, audit_entity_1.Audit]),
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [business_units_controller_1.AdminBusinessUnitsController],
        providers: [business_units_service_1.AdminBusinessUnitsService],
        exports: [business_units_service_1.AdminBusinessUnitsService],
    })
], AdminBusinessUnitsModule);
//# sourceMappingURL=business-units.module.js.map