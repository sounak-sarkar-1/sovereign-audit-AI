"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audits_controller_1 = require("./audits.controller");
const audits_service_1 = require("./audits.service");
const audit_entity_1 = require("../../database/entities/audit.entity");
let AdminAuditsModule = class AdminAuditsModule {
};
exports.AdminAuditsModule = AdminAuditsModule;
exports.AdminAuditsModule = AdminAuditsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([audit_entity_1.Audit])],
        controllers: [audits_controller_1.AdminAuditsController],
        providers: [audits_service_1.AdminAuditsService],
        exports: [audits_service_1.AdminAuditsService],
    })
], AdminAuditsModule);
//# sourceMappingURL=audits.module.js.map