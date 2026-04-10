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
exports.ManagerReportsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let ManagerReportsController = class ManagerReportsController {
    constructor(service) {
        this.service = service;
    }
    generate(auditId, manager) {
        return this.service.generate(auditId, manager);
    }
    findAll(auditId) {
        return this.service.findAll(auditId);
    }
    sendToClient(auditId, reportId, manager) {
        return this.service.sendToClient(auditId, reportId, manager);
    }
    finalize(auditId, reportId, manager) {
        return this.service.finalize(auditId, reportId, manager);
    }
    async download(auditId, reportId, res) {
        return this.service.download(auditId, reportId, res);
    }
    async upload(auditId, reportId, file, manager) {
        return this.service.uploadVersion(auditId, reportId, file, manager);
    }
};
exports.ManagerReportsController = ManagerReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerReportsController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':rId/send-to-client'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('rId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerReportsController.prototype, "sendToClient", null);
__decorate([
    (0, common_1.Post)(':rId/finalize'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('rId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerReportsController.prototype, "finalize", null);
__decorate([
    (0, common_1.Get)(':rId/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('rId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagerReportsController.prototype, "download", null);
__decorate([
    (0, common_1.Post)(':rId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('rId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ManagerReportsController.prototype, "upload", null);
exports.ManagerReportsController = ManagerReportsController = __decorate([
    (0, common_1.Controller)('manager/audits/:id/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __metadata("design:paramtypes", [reports_service_1.ManagerReportsService])
], ManagerReportsController);
//# sourceMappingURL=reports.controller.js.map