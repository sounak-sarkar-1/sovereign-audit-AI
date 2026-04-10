"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientClarificationsController = void 0;
const common_1 = require("@nestjs/common");
const clarifications_service_1 = require("./clarifications.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const clarification_request_entity_1 = require("../../database/entities/clarification-request.entity");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ClientClarificationsController = class ClientClarificationsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(clientId, status) {
        return this.service.findAll(clientId, status);
    }
    async findOne(id, clientId) {
        return this.service.findOne(id, clientId);
    }
    respond(id, message, attachmentFileIds, client) {
        if (!message || message.trim().length < 2) {
            throw new common_1.BadRequestException('Reply message cannot be empty');
        }
        return this.service.respond(id, client.id, message, attachmentFileIds);
    }
};
exports.ClientClarificationsController = ClientClarificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientClarificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientClarificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('message')),
    __param(2, (0, common_1.Body)('attachmentFileIds')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ClientClarificationsController.prototype, "respond", null);
exports.ClientClarificationsController = ClientClarificationsController = __decorate([
    (0, common_1.Controller)('client/clarifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.CLIENT),
    __metadata("design:paramtypes", [clarifications_service_1.ClientClarificationsService])
], ClientClarificationsController);
//# sourceMappingURL=clarifications.controller.js.map