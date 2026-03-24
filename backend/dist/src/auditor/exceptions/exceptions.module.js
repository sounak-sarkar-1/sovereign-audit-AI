"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorExceptionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exceptions_controller_1 = require("./exceptions.controller");
const exceptions_service_1 = require("./exceptions.service");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
const audit_trail_module_1 = require("../../shared/audit-trail/audit-trail.module");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
let AuditorExceptionsModule = class AuditorExceptionsModule {
};
exports.AuditorExceptionsModule = AuditorExceptionsModule;
exports.AuditorExceptionsModule = AuditorExceptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                exception_request_entity_1.ExceptionRequest,
                audit_scope_line_item_entity_1.AuditScopeLineItem,
                audit_entity_1.Audit,
                uploaded_file_entity_1.UploadedFile,
            ]),
            notifications_module_1.NotificationsModule,
            audit_trail_module_1.AuditTrailModule,
        ],
        controllers: [exceptions_controller_1.AuditorExceptionsController],
        providers: [exceptions_service_1.AuditorExceptionsService],
        exports: [exceptions_service_1.AuditorExceptionsService],
    })
], AuditorExceptionsModule);
//# sourceMappingURL=exceptions.module.js.map