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
exports.AdminAuditTrailController = void 0;
const common_1 = require("@nestjs/common");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminAuditTrailController = class AdminAuditTrailController {
    constructor(service) {
        this.service = service;
    }
    findAll(page, limit, action, entityType, actorId, search, startDate, endDate) {
        return this.service.findAll({ page, limit, action, entityType, actorId, search, startDate, endDate });
    }
    async export(res, format = 'csv', startDate, endDate) {
        const { data: logs } = await this.service.findAll({ startDate, endDate, limit: 10000 });
        if (format === 'csv') {
            const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Entity ID', 'IP'];
            const rows = logs.map(l => [
                l.createdAt, l.actorUserId, l.actorRole, l.actionType,
                l.entityType, l.entityId, l.ipAddress || ''
            ]);
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.csv"`);
            return res.send(csv);
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.json"`);
        return res.json(logs);
    }
};
exports.AdminAuditTrailController = AdminAuditTrailController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('entityType')),
    __param(4, (0, common_1.Query)('actorId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminAuditTrailController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminAuditTrailController.prototype, "export", null);
exports.AdminAuditTrailController = AdminAuditTrailController = __decorate([
    (0, common_1.Controller)('admin/audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [audit_trail_service_1.AuditTrailService])
], AdminAuditTrailController);
//# sourceMappingURL=audit-trail.controller.js.map