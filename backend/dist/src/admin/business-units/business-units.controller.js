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
exports.AdminBusinessUnitsController = void 0;
const common_1 = require("@nestjs/common");
const business_units_service_1 = require("./business-units.service");
const create_business_unit_dto_1 = require("./dto/create-business-unit.dto");
const update_business_unit_dto_1 = require("./dto/update-business-unit.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminBusinessUnitsController = class AdminBusinessUnitsController {
    constructor(service) {
        this.service = service;
    }
    async create(clientId, dto, req) {
        return await this.service.create(clientId, dto, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async findAll(clientId) {
        return await this.service.findAllByClient(clientId);
    }
    async update(clientId, buId, dto, req) {
        return await this.service.update(clientId, buId, dto, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async remove(clientId, buId, req) {
        return await this.service.remove(clientId, buId, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
};
exports.AdminBusinessUnitsController = AdminBusinessUnitsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_business_unit_dto_1.CreateBusinessUnitDto, Object]),
    __metadata("design:returntype", Promise)
], AdminBusinessUnitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBusinessUnitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':buId'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Param)('buId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_business_unit_dto_1.UpdateBusinessUnitDto, Object]),
    __metadata("design:returntype", Promise)
], AdminBusinessUnitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':buId'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Param)('buId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminBusinessUnitsController.prototype, "remove", null);
exports.AdminBusinessUnitsController = AdminBusinessUnitsController = __decorate([
    (0, common_1.Controller)('admin/clients/:clientId/business-units'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [business_units_service_1.AdminBusinessUnitsService])
], AdminBusinessUnitsController);
//# sourceMappingURL=business-units.controller.js.map