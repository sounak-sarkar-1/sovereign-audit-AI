"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminExceptionalRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exceptional_requests_controller_1 = require("./exceptional-requests.controller");
const exceptional_requests_service_1 = require("./exceptional-requests.service");
const exceptional_action_request_entity_1 = require("../../database/entities/exceptional-action-request.entity");
const audit_entity_1 = require("../../database/entities/audit.entity");
const audit_trail_log_entity_1 = require("../../database/entities/audit-trail-log.entity");
const files_module_1 = require("../../shared/files/files.module");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
let AdminExceptionalRequestsModule = class AdminExceptionalRequestsModule {
};
exports.AdminExceptionalRequestsModule = AdminExceptionalRequestsModule;
exports.AdminExceptionalRequestsModule = AdminExceptionalRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                exceptional_action_request_entity_1.ExceptionalActionRequest,
                audit_entity_1.Audit,
                audit_trail_log_entity_1.AuditTrailLog,
            ]),
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [exceptional_requests_controller_1.AdminExceptionalRequestsController],
        providers: [exceptional_requests_service_1.AdminExceptionalRequestsService],
        exports: [exceptional_requests_service_1.AdminExceptionalRequestsService],
    })
], AdminExceptionalRequestsModule);
//# sourceMappingURL=exceptional-requests.module.js.map