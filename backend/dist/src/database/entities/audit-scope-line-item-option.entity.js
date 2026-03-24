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
exports.AuditScopeLineItemOption = void 0;
const typeorm_1 = require("typeorm");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
let AuditScopeLineItemOption = class AuditScopeLineItemOption {
};
exports.AuditScopeLineItemOption = AuditScopeLineItemOption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditScopeLineItemOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditScopeLineItemOption.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem, (lineItem) => lineItem.options, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], AuditScopeLineItemOption.prototype, "lineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'option_text', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AuditScopeLineItemOption.prototype, "optionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], AuditScopeLineItemOption.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditScopeLineItemOption.prototype, "createdAt", void 0);
exports.AuditScopeLineItemOption = AuditScopeLineItemOption = __decorate([
    (0, typeorm_1.Entity)('audit_scope_line_item_options')
], AuditScopeLineItemOption);
//# sourceMappingURL=audit-scope-line-item-option.entity.js.map