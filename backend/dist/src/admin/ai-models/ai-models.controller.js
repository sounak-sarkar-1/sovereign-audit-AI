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
exports.AdminAiModelsController = void 0;
const common_1 = require("@nestjs/common");
const ai_models_service_1 = require("./ai-models.service");
const create_ai_model_dto_1 = require("./dto/create-ai-model.dto");
const update_ai_model_dto_1 = require("./dto/update-ai-model.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminAiModelsController = class AdminAiModelsController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        return await this.service.create(dto, req.user.id, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async findAll() {
        return await this.service.findAll();
    }
    async findOne(id) {
        return await this.service.findOne(id);
    }
    async update(id, dto, req) {
        return await this.service.update(id, dto, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async remove(id, req) {
        return await this.service.remove(id, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async activate(id, req) {
        return await this.service.activate(id, {
            id: req.user.id,
            role: req.user.role,
            ip: req.ip,
        });
    }
    async test(id) {
        return await this.service.testConnection(id);
    }
};
exports.AdminAiModelsController = AdminAiModelsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ai_model_dto_1.CreateAiModelDto, Object]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ai_model_dto_1.UpdateAiModelDto, Object]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/test'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAiModelsController.prototype, "test", null);
exports.AdminAiModelsController = AdminAiModelsController = __decorate([
    (0, common_1.Controller)('admin/ai-models'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [ai_models_service_1.AdminAiModelsService])
], AdminAiModelsController);
//# sourceMappingURL=ai-models.controller.js.map