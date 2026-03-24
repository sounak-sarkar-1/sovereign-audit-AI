"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMappingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mappings_controller_1 = require("./mappings.controller");
const mappings_service_1 = require("./mappings.service");
const manager_auditor_mapping_entity_1 = require("../../database/entities/manager-auditor-mapping.entity");
const manager_client_mapping_entity_1 = require("../../database/entities/manager-client-mapping.entity");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
let AdminMappingsModule = class AdminMappingsModule {
};
exports.AdminMappingsModule = AdminMappingsModule;
exports.AdminMappingsModule = AdminMappingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([manager_auditor_mapping_entity_1.ManagerAuditorMapping, manager_client_mapping_entity_1.ManagerClientMapping]),
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [mappings_controller_1.AdminMappingsController],
        providers: [mappings_service_1.AdminMappingsService],
        exports: [mappings_service_1.AdminMappingsService],
    })
], AdminMappingsModule);
//# sourceMappingURL=mappings.module.js.map