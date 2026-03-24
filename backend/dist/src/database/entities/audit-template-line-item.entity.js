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
exports.AuditTemplateLineItem = exports.InputMethod = void 0;
const typeorm_1 = require("typeorm");
const audit_template_entity_1 = require("./audit-template.entity");
const audit_template_option_entity_1 = require("./audit-template-option.entity");
var InputMethod;
(function (InputMethod) {
    InputMethod["FREE_TEXT"] = "free_text";
    InputMethod["MULTIPLE_CHOICE"] = "multiple_choice";
})(InputMethod || (exports.InputMethod = InputMethod = {}));
let AuditTemplateLineItem = class AuditTemplateLineItem {
};
exports.AuditTemplateLineItem = AuditTemplateLineItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditTemplateLineItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditTemplateLineItem.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_template_entity_1.AuditTemplate, (template) => template.lineItems),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", audit_template_entity_1.AuditTemplate)
], AuditTemplateLineItem.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AuditTemplateLineItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AuditTemplateLineItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'input_method',
        type: 'enum',
        enum: InputMethod,
    }),
    __metadata("design:type", String)
], AuditTemplateLineItem.prototype, "inputMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_optional', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AuditTemplateLineItem.prototype, "isOptional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], AuditTemplateLineItem.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_template_option_entity_1.AuditTemplateOption, (option) => option.lineItem, { cascade: true }),
    __metadata("design:type", Array)
], AuditTemplateLineItem.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditTemplateLineItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditTemplateLineItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AuditTemplateLineItem.prototype, "deletedAt", void 0);
exports.AuditTemplateLineItem = AuditTemplateLineItem = __decorate([
    (0, typeorm_1.Entity)('audit_template_line_items')
], AuditTemplateLineItem);
//# sourceMappingURL=audit-template-line-item.entity.js.map