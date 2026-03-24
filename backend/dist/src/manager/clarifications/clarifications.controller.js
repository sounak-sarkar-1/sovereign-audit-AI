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
exports.ManagerClarificationsController = void 0;
const common_1 = require("@nestjs/common");
const clarifications_service_1 = require("./clarifications.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const create_clarification_dto_1 = require("./dto/create-clarification.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const clarification_request_entity_1 = require("../../database/entities/clarification-request.entity");
let ManagerClarificationsController = class ManagerClarificationsController {
    constructor(service) {
        this.service = service;
    }
    findAll(status, manager) {
        return this.service.findAll(status, manager);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    close(id, manager) {
        return this.service.close(id, manager);
    }
    create(auditId, dto, manager) {
        dto.auditId = auditId;
        return this.service.create(dto, manager);
    }
};
exports.ManagerClarificationsController = ManagerClarificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerClarificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerClarificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerClarificationsController.prototype, "close", null);
__decorate([
    (0, common_1.Post)('audits/:auditId'),
    __param(0, (0, common_1.Param)('auditId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_clarification_dto_1.CreateClarificationDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerClarificationsController.prototype, "create", null);
exports.ManagerClarificationsController = ManagerClarificationsController = __decorate([
    (0, common_1.Controller)('manager/clarifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __metadata("design:paramtypes", [clarifications_service_1.ManagerClarificationsService])
], ManagerClarificationsController);
//# sourceMappingURL=clarifications.controller.js.map