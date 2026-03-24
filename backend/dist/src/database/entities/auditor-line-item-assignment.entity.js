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
exports.AuditorLineItemAssignment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
let AuditorLineItemAssignment = class AuditorLineItemAssignment {
};
exports.AuditorLineItemAssignment = AuditorLineItemAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditorLineItemAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_scope_line_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditorLineItemAssignment.prototype, "auditScopeLineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem, (lineItem) => lineItem.assignments),
    (0, typeorm_1.JoinColumn)({ name: 'audit_scope_line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], AuditorLineItemAssignment.prototype, "auditScopeLineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auditor_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditorLineItemAssignment.prototype, "auditorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'auditor_id' }),
    __metadata("design:type", user_entity_1.User)
], AuditorLineItemAssignment.prototype, "auditor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditorLineItemAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AuditorLineItemAssignment.prototype, "deletedAt", void 0);
exports.AuditorLineItemAssignment = AuditorLineItemAssignment = __decorate([
    (0, typeorm_1.Entity)('auditor_line_item_assignments')
], AuditorLineItemAssignment);
//# sourceMappingURL=auditor-line-item-assignment.entity.js.map