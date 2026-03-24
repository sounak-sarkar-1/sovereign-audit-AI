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
exports.ManagerAuditsController = void 0;
const common_1 = require("@nestjs/common");
const audits_service_1 = require("./audits.service");
const audit_entity_1 = require("../../database/entities/audit.entity");
const create_audit_dto_1 = require("./dto/create-audit.dto");
const update_audit_dto_1 = require("./dto/update-audit.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let ManagerAuditsController = class ManagerAuditsController {
    constructor(auditsService) {
        this.auditsService = auditsService;
    }
    async findAll(req, page = 1, limit = 10, status) {
        return this.auditsService.findAll(req.user.id, page, limit, status);
    }
    async create(req, createDto) {
        return this.auditsService.create(createDto, req.user.id);
    }
    async findOne(id) {
        return this.auditsService.findOne(id);
    }
    async update(id, updateDto, req) {
        return this.auditsService.update(id, updateDto, req.user.id);
    }
    async start(id, req) {
        return this.auditsService.start(id, req.user.id);
    }
    async getClients(req) {
        return this.auditsService.getClients(req.user.id);
    }
};
exports.ManagerAuditsController = ManagerAuditsController;
__decorate([
    (0, common_1.Get)('audits'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('audits'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_audit_dto_1.CreateAuditDto]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('audits/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('audits/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_audit_dto_1.UpdateAuditDto, Object]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('audits/:id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('clients'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerAuditsController.prototype, "getClients", null);
exports.ManagerAuditsController = ManagerAuditsController = __decorate([
    (0, common_1.Controller)('manager'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MANAGER),
    __metadata("design:paramtypes", [audits_service_1.ManagerAuditsService])
], ManagerAuditsController);
//# sourceMappingURL=audits.controller.js.map