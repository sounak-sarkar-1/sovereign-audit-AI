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
exports.ManagerAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const assignments_service_1 = require("./assignments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const assign_auditor_dto_1 = require("./dto/assign-auditor.dto");
const assign_line_item_dto_1 = require("./dto/assign-line-item.dto");
let ManagerAssignmentsController = class ManagerAssignmentsController {
    constructor(service) {
        this.service = service;
    }
    async getAssignments(auditId) {
        return this.service.getAssignments(auditId);
    }
    async assignToBU(auditId, dto, managerId) {
        return this.service.assignToBU(auditId, dto, managerId);
    }
    async unassignFromBU(auditId, assignmentId, managerId) {
        return this.service.unassignFromBU(auditId, assignmentId, managerId);
    }
    async assignToLineItem(auditId, dto, managerId) {
        return this.service.assignToLineItem(auditId, dto, managerId);
    }
    async unassignFromLineItem(auditId, assignmentId, managerId) {
        return this.service.unassignFromLineItem(auditId, assignmentId, managerId);
    }
};
exports.ManagerAssignmentsController = ManagerAssignmentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManagerAssignmentsController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_auditor_dto_1.AssignAuditorDto, String]),
    __metadata("design:returntype", Promise)
], ManagerAssignmentsController.prototype, "assignToBU", null);
__decorate([
    (0, common_1.Delete)(':assignmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('assignmentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ManagerAssignmentsController.prototype, "unassignFromBU", null);
__decorate([
    (0, common_1.Post)('line-items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_line_item_dto_1.AssignLineItemDto, String]),
    __metadata("design:returntype", Promise)
], ManagerAssignmentsController.prototype, "assignToLineItem", null);
__decorate([
    (0, common_1.Delete)('line-items/:assignmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('assignmentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ManagerAssignmentsController.prototype, "unassignFromLineItem", null);
exports.ManagerAssignmentsController = ManagerAssignmentsController = __decorate([
    (0, common_1.Controller)('manager/audits/:id/assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __metadata("design:paramtypes", [assignments_service_1.ManagerAssignmentsService])
], ManagerAssignmentsController);
//# sourceMappingURL=assignments.controller.js.map