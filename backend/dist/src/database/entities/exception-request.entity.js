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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionRequest = exports.ExceptionStatus = void 0;
const typeorm_1 = require("typeorm");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
const user_entity_1 = require("./user.entity");
var ExceptionStatus;
(function (ExceptionStatus) {
    ExceptionStatus["PENDING"] = "pending";
    ExceptionStatus["APPROVED"] = "approved";
    ExceptionStatus["REJECTED"] = "rejected";
})(ExceptionStatus || (exports.ExceptionStatus = ExceptionStatus = {}));
let ExceptionRequest = class ExceptionRequest {
};
exports.ExceptionRequest = ExceptionRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_scope_line_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "auditScopeLineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem),
    (0, typeorm_1.JoinColumn)({ name: 'audit_scope_line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], ExceptionRequest.prototype, "auditScopeLineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auditor_id', type: 'uuid' }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "auditorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'auditor_id' }),
    __metadata("design:type", user_entity_1.User)
], ExceptionRequest.prototype, "auditor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'uuid' }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], ExceptionRequest.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "justification", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExceptionStatus,
        default: ExceptionStatus.PENDING,
    }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_comment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ExceptionRequest.prototype, "managerComment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExceptionRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExceptionRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ExceptionRequest.prototype, "resolvedAt", void 0);
exports.ExceptionRequest = ExceptionRequest = __decorate([
    (0, typeorm_1.Entity)('exception_requests')
], ExceptionRequest);
//# sourceMappingURL=exception-request.entity.js.map