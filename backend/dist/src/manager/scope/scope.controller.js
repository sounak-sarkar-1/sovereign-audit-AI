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
exports.ManagerScopeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const scope_service_1 = require("./scope.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const create_scope_items_dto_1 = require("./dto/create-scope-items.dto");
const update_scope_item_dto_1 = require("./dto/update-scope-item.dto");
const import_from_template_dto_1 = require("./dto/import-from-template.dto");
const confirm_excel_import_dto_1 = require("./dto/confirm-excel-import.dto");
let ManagerScopeController = class ManagerScopeController {
    constructor(service) {
        this.service = service;
    }
    findAll(auditId) {
        return this.service.findAll(auditId);
    }
    create(auditId, dto) {
        return this.service.createLineItems(auditId, dto);
    }
    createBatch(auditId, dto) {
        return this.service.createLineItems(auditId, dto);
    }
    update(auditId, lineItemId, dto) {
        return this.service.updateLineItem(auditId, lineItemId, dto);
    }
    remove(auditId, lineItemId) {
        return this.service.removeLineItem(auditId, lineItemId);
    }
    importFromTemplate(auditId, dto) {
        return this.service.importFromTemplate(auditId, dto);
    }
    extractFromDocument(auditId, file, buId, user) {
        return this.service.extractFromDocument(auditId, file, buId, user.id);
    }
    importFromExcel(auditId, file, buId) {
        return this.service.importFromExcel(auditId, file, buId);
    }
    confirmExcelImport(auditId, importId, dto) {
        return this.service.confirmExcelImport(auditId, importId, dto);
    }
};
exports.ManagerScopeController = ManagerScopeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('line-items'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_scope_items_dto_1.CreateScopeItemsDto]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('line-items/batch'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_scope_items_dto_1.CreateScopeItemsDto]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Put)('line-items/:lineItemId'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('lineItemId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_scope_item_dto_1.UpdateScopeItemDto]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('line-items/:lineItemId'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('lineItemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('import-from-template'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, import_from_template_dto_1.ImportFromTemplateDto]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "importFromTemplate", null);
__decorate([
    (0, common_1.Post)('extract-from-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('auditBusinessUnitId', common_1.ParseUUIDPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "extractFromDocument", null);
__decorate([
    (0, common_1.Post)('import-from-excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('auditBusinessUnitId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "importFromExcel", null);
__decorate([
    (0, common_1.Post)('import-from-excel/:importId/confirm'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('importId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, confirm_excel_import_dto_1.ConfirmExcelImportDto]),
    __metadata("design:returntype", void 0)
], ManagerScopeController.prototype, "confirmExcelImport", null);
exports.ManagerScopeController = ManagerScopeController = __decorate([
    (0, common_1.Controller)('manager/audits/:auditId/scope'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __metadata("design:paramtypes", [scope_service_1.ManagerScopeService])
], ManagerScopeController);
//# sourceMappingURL=scope.controller.js.map