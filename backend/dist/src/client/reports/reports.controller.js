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
exports.ClientReportsController = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const submit_feedback_dto_1 = require("./dto/submit-feedback.dto");
let ClientReportsController = class ClientReportsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req) {
        return this.service.findAll(req.user.id);
    }
    async findOne(id, req) {
        return this.service.findOne(id, req.user.id);
    }
    async submitFeedback(id, dto, req) {
        return this.service.submitFeedback(id, dto, req.user.id);
    }
    async download(id, req, res) {
        const file = await this.service.download(id, req.user.id);
        const stream = fs.createReadStream(file.filePath);
        res.set({
            'Content-Type': file.mimeType,
            'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
        });
        return new common_1.StreamableFile(stream);
    }
};
exports.ClientReportsController = ClientReportsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_feedback_dto_1.SubmitReportFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], ClientReportsController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientReportsController.prototype, "download", null);
exports.ClientReportsController = ClientReportsController = __decorate([
    (0, common_1.Controller)('client/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.CLIENT),
    __metadata("design:paramtypes", [reports_service_1.ClientReportsService])
], ClientReportsController);
//# sourceMappingURL=reports.controller.js.map