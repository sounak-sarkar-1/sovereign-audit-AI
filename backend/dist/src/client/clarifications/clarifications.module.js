"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientClarificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const clarifications_controller_1 = require("./clarifications.controller");
const clarifications_service_1 = require("./clarifications.service");
const clarification_request_entity_1 = require("../../database/entities/clarification-request.entity");
const clarification_response_entity_1 = require("../../database/entities/clarification-response.entity");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
const notifications_module_1 = require("../../shared/notifications/notifications.module");
let ClientClarificationsModule = class ClientClarificationsModule {
};
exports.ClientClarificationsModule = ClientClarificationsModule;
exports.ClientClarificationsModule = ClientClarificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([clarification_request_entity_1.ClarificationRequest, clarification_response_entity_1.ClarificationResponse, uploaded_file_entity_1.UploadedFile]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [clarifications_controller_1.ClientClarificationsController],
        providers: [clarifications_service_1.ClientClarificationsService],
        exports: [clarifications_service_1.ClientClarificationsService]
    })
], ClientClarificationsModule);
//# sourceMappingURL=clarifications.module.js.map