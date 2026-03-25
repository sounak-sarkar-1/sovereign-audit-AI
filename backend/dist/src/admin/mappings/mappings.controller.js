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
exports.AdminMappingsController = void 0;
const common_1 = require("@nestjs/common");
const mappings_service_1 = require("./mappings.service");
const create_mapping_dto_1 = require("./dto/create-mapping.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminMappingsController = class AdminMappingsController {
    constructor(service) {
        this.service = service;
    }
    async getManagerAuditorMappings() {
        return await this.service.getManagerAuditorMappings();
    }
    async getManagerClientMappings() {
        return await this.service.getManagerClientMappings();
    }
    async addManagerAuditor(dto, req) {
        return await this.service.addManagerAuditorMapping(dto, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async removeManagerAuditor(managerId, auditorId, req) {
        return await this.service.removeManagerAuditorMapping(managerId, auditorId, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async addManagerClient(dto, req) {
        return await this.service.addManagerClientMapping(dto, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async removeManagerClient(managerId, clientId, req) {
        return await this.service.removeManagerClientMapping(managerId, clientId, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
};
exports.AdminMappingsController = AdminMappingsController;
__decorate([
    (0, common_1.Get)('manager-auditor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "getManagerAuditorMappings", null);
__decorate([
    (0, common_1.Get)('manager-client'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "getManagerClientMappings", null);
__decorate([
    (0, common_1.Post)('manager-auditor'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mapping_dto_1.CreateMappingDto, Object]),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "addManagerAuditor", null);
__decorate([
    (0, common_1.Delete)('manager-auditor'),
    __param(0, (0, common_1.Query)('managerId')),
    __param(1, (0, common_1.Query)('auditorId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "removeManagerAuditor", null);
__decorate([
    (0, common_1.Post)('manager-client'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mapping_dto_1.CreateMappingDto, Object]),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "addManagerClient", null);
__decorate([
    (0, common_1.Delete)('manager-client'),
    __param(0, (0, common_1.Query)('managerId')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminMappingsController.prototype, "removeManagerClient", null);
exports.AdminMappingsController = AdminMappingsController = __decorate([
    (0, common_1.Controller)('admin/mappings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [mappings_service_1.AdminMappingsService])
], AdminMappingsController);
//# sourceMappingURL=mappings.controller.js.map