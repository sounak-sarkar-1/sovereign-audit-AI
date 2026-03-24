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
exports.LineItemResponse = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
const audit_scope_line_item_option_entity_1 = require("./audit-scope-line-item-option.entity");
let LineItemResponse = class LineItemResponse {
};
exports.LineItemResponse = LineItemResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LineItemResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_scope_line_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], LineItemResponse.prototype, "auditScopeLineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'audit_scope_line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], LineItemResponse.prototype, "lineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auditor_id', type: 'uuid' }),
    __metadata("design:type", String)
], LineItemResponse.prototype, "auditorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'auditor_id' }),
    __metadata("design:type", user_entity_1.User)
], LineItemResponse.prototype, "auditor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LineItemResponse.prototype, "responseText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'selected_option_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LineItemResponse.prototype, "selectedOptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'selected_option_id' }),
    __metadata("design:type", audit_scope_line_item_option_entity_1.AuditScopeLineItemOption)
], LineItemResponse.prototype, "selectedOption", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LineItemResponse.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_draft', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], LineItemResponse.prototype, "isDraft", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LineItemResponse.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], LineItemResponse.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], LineItemResponse.prototype, "deletedAt", void 0);
exports.LineItemResponse = LineItemResponse = __decorate([
    (0, typeorm_1.Entity)('line_item_responses'),
    (0, typeorm_1.Index)(['auditScopeLineItemId', 'auditorId'], { unique: true, where: '"deleted_at" IS NULL' })
], LineItemResponse);
//# sourceMappingURL=line-item-response.entity.js.map