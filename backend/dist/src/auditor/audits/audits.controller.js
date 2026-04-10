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
exports.AuditorAuditsController = void 0;
const common_1 = require("@nestjs/common");
const audits_service_1 = require("./audits.service");
const scope_service_1 = require("../scope/scope.service");
const exceptions_service_1 = require("../exceptions/exceptions.service");
const update_response_dto_1 = require("../scope/dto/update-response.dto");
const create_exception_dto_1 = require("../exceptions/dto/create-exception.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let AuditorAuditsController = class AuditorAuditsController {
    constructor(service, scopeService, exceptionsService) {
        this.service = service;
        this.scopeService = scopeService;
        this.exceptionsService = exceptionsService;
    }
    findAll(user) {
        return this.service.findAll(user);
    }
    getPerformance(user) {
        return this.service.getPerformance(user);
    }
    findOne(id, user) {
        return this.service.findOne(id, user);
    }
    getScope(id, user) {
        return this.scopeService.getScope(id, user);
    }
    updateResponse(id, liId, dto, user) {
        return this.scopeService.updateResponse(id, liId, user, dto);
    }
    getExceptions(id, user) {
        return this.exceptionsService.findByAudit(id, user);
    }
    createException(id, dto, user) {
        return this.exceptionsService.create(id, user, dto);
    }
    getScopeItemComments(liId) {
        return this.scopeService.getComments(liId);
    }
    addScopeItemComment(liId, content, user) {
        return this.scopeService.addComment(liId, user, content);
    }
};
exports.AuditorAuditsController = AuditorAuditsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/scope'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "getScope", null);
__decorate([
    (0, common_1.Put)(':id/scope/:liId/response'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('liId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_response_dto_1.UpdateResponseDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "updateResponse", null);
__decorate([
    (0, common_1.Get)(':id/exceptions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "getExceptions", null);
__decorate([
    (0, common_1.Post)(':id/exceptions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_exception_dto_1.CreateExceptionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "createException", null);
__decorate([
    (0, common_1.Get)(':id/scope/:liId/comments'),
    __param(0, (0, common_1.Param)('liId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "getScopeItemComments", null);
__decorate([
    (0, common_1.Post)(':id/scope/:liId/comments'),
    __param(0, (0, common_1.Param)('liId')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditorAuditsController.prototype, "addScopeItemComment", null);
exports.AuditorAuditsController = AuditorAuditsController = __decorate([
    (0, common_1.Controller)('auditor/audits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('auditor'),
    __metadata("design:paramtypes", [audits_service_1.AuditorAuditsService,
        scope_service_1.AuditorScopeService,
        exceptions_service_1.AuditorExceptionsService])
], AuditorAuditsController);
//# sourceMappingURL=audits.controller.js.map