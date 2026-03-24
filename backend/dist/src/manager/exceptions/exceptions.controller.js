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
exports.ManagerExceptionsController = void 0;
const common_1 = require("@nestjs/common");
const exceptions_service_1 = require("./exceptions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const exception_action_dto_1 = require("./dto/exception-action.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const exception_request_entity_1 = require("../../database/entities/exception-request.entity");
let ManagerExceptionsController = class ManagerExceptionsController {
    constructor(service) {
        this.service = service;
    }
    findAll(auditId, status, manager) {
        if (auditId === 'all') {
            return this.service.findAllGlobal(status, manager);
        }
        return this.service.findAll(auditId, status);
    }
    approve(exId, dto, manager) {
        return this.service.approve(exId, dto, manager);
    }
    reject(exId, dto, manager) {
        return this.service.reject(exId, dto, manager);
    }
};
exports.ManagerExceptionsController = ManagerExceptionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerExceptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':exId/approve'),
    __param(0, (0, common_1.Param)('exId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exception_action_dto_1.ApproveExceptionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerExceptionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':exId/reject'),
    __param(0, (0, common_1.Param)('exId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exception_action_dto_1.RejectExceptionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerExceptionsController.prototype, "reject", null);
exports.ManagerExceptionsController = ManagerExceptionsController = __decorate([
    (0, common_1.Controller)('manager/audits/:id/exceptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __metadata("design:paramtypes", [exceptions_service_1.ManagerExceptionsService])
], ManagerExceptionsController);
//# sourceMappingURL=exceptions.controller.js.map