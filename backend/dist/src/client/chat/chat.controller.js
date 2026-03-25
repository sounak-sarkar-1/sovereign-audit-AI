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
exports.ClientChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("../../shared/chat/chat.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ClientChatController = class ClientChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getMessages(auditId) {
        return this.chatService.getMessages(auditId);
    }
    async sendMessage(auditId, content, user) {
        return this.chatService.sendMessage(auditId, user, content);
    }
    async markAsRead(auditId, user) {
        return this.chatService.markAsRead(auditId, user.id);
    }
};
exports.ClientChatController = ClientChatController;
__decorate([
    (0, common_1.Get)(':auditId'),
    __param(0, (0, common_1.Param)('auditId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':auditId'),
    __param(0, (0, common_1.Param)('auditId')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ClientChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':auditId/read'),
    __param(0, (0, common_1.Param)('auditId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ClientChatController.prototype, "markAsRead", null);
exports.ClientChatController = ClientChatController = __decorate([
    (0, common_1.Controller)('client/chats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.CLIENT),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ClientChatController);
//# sourceMappingURL=chat.controller.js.map