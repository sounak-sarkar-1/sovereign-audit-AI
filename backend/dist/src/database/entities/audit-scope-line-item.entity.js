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
exports.AuditScopeLineItem = exports.LineItemStatus = exports.LineItemSource = exports.InputMethod = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const audit_business_unit_entity_1 = require("./audit-business-unit.entity");
const audit_scope_line_item_option_entity_1 = require("./audit-scope-line-item-option.entity");
const line_item_response_entity_1 = require("./line-item-response.entity");
const auditor_line_item_assignment_entity_1 = require("./auditor-line-item-assignment.entity");
var InputMethod;
(function (InputMethod) {
    InputMethod["FREE_TEXT"] = "free_text";
    InputMethod["MULTIPLE_CHOICE"] = "multiple_choice";
})(InputMethod || (exports.InputMethod = InputMethod = {}));
var LineItemSource;
(function (LineItemSource) {
    LineItemSource["MANUAL"] = "manual";
    LineItemSource["AI_EXTRACTED"] = "ai_extracted";
    LineItemSource["EXCEL_IMPORTED"] = "excel_imported";
    LineItemSource["TEMPLATE"] = "template";
})(LineItemSource || (exports.LineItemSource = LineItemSource = {}));
var LineItemStatus;
(function (LineItemStatus) {
    LineItemStatus["NOT_STARTED"] = "not_started";
    LineItemStatus["DRAFT_SAVED"] = "draft_saved";
    LineItemStatus["SUBMITTED"] = "submitted";
    LineItemStatus["EXCEPTION_PENDING"] = "exception_pending";
    LineItemStatus["EXCEPTION_APPROVED"] = "exception_approved";
    LineItemStatus["EXCEPTION_REJECTED"] = "exception_rejected";
    LineItemStatus["RETURNED"] = "returned";
})(LineItemStatus || (exports.LineItemStatus = LineItemStatus = {}));
let AuditScopeLineItem = class AuditScopeLineItem {
};
exports.AuditScopeLineItem = AuditScopeLineItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], AuditScopeLineItem.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_business_unit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "auditBusinessUnitId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_business_unit_entity_1.AuditBusinessUnit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_business_unit_id' }),
    __metadata("design:type", audit_business_unit_entity_1.AuditBusinessUnit)
], AuditScopeLineItem.prototype, "auditBusinessUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'input_method',
        type: 'enum',
        enum: InputMethod,
    }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "inputMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_optional', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AuditScopeLineItem.prototype, "isOptional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], AuditScopeLineItem.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LineItemSource,
        default: LineItemSource.MANUAL,
    }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LineItemStatus,
        default: LineItemStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], AuditScopeLineItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, (option) => option.lineItem, { cascade: true }),
    __metadata("design:type", Array)
], AuditScopeLineItem.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => line_item_response_entity_1.LineItemResponse, (response) => response.lineItem),
    __metadata("design:type", Array)
], AuditScopeLineItem.prototype, "responses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => auditor_line_item_assignment_entity_1.AuditorLineItemAssignment, (assignment) => assignment.auditScopeLineItem),
    __metadata("design:type", Array)
], AuditScopeLineItem.prototype, "assignments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditScopeLineItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditScopeLineItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AuditScopeLineItem.prototype, "deletedAt", void 0);
exports.AuditScopeLineItem = AuditScopeLineItem = __decorate([
    (0, typeorm_1.Entity)('audit_scope_line_items')
], AuditScopeLineItem);
//# sourceMappingURL=audit-scope-line-item.entity.js.map