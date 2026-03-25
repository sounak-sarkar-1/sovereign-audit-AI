"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailModule = void 0;
const audit_trail_controller_1 = require("../../admin/audit-trail/audit-trail.controller");
let AuditTrailModule = class AuditTrailModule {
};
exports.AuditTrailModule = AuditTrailModule;
exports.AuditTrailModule = AuditTrailModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([AuditTrailLog])],
        controllers: [audit_trail_controller_1.AdminAuditTrailController],
        providers: [AuditTrailService],
        exports: [AuditTrailService],
    })
], AuditTrailModule);
//# sourceMappingURL=audit-trail.module.js.map