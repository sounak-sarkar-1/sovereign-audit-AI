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
exports.CorrectiveActionPlan = exports.CorrectiveActionPriority = exports.CorrectiveActionStatus = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const audit_scope_line_item_entity_1 = require("./audit-scope-line-item.entity");
const user_entity_1 = require("./user.entity");
var CorrectiveActionStatus;
(function (CorrectiveActionStatus) {
    CorrectiveActionStatus["PENDING"] = "pending";
    CorrectiveActionStatus["IN_PROGRESS"] = "in_progress";
    CorrectiveActionStatus["ON_HOLD"] = "on_hold";
    CorrectiveActionStatus["COMPLETED"] = "completed";
    CorrectiveActionStatus["VERIFIED"] = "verified";
})(CorrectiveActionStatus || (exports.CorrectiveActionStatus = CorrectiveActionStatus = {}));
var CorrectiveActionPriority;
(function (CorrectiveActionPriority) {
    CorrectiveActionPriority["LOW"] = "low";
    CorrectiveActionPriority["MEDIUM"] = "medium";
    CorrectiveActionPriority["HIGH"] = "high";
    CorrectiveActionPriority["CRITICAL"] = "critical";
})(CorrectiveActionPriority || (exports.CorrectiveActionPriority = CorrectiveActionPriority = {}));
let CorrectiveActionPlan = class CorrectiveActionPlan {
};
exports.CorrectiveActionPlan = CorrectiveActionPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], CorrectiveActionPlan.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_scope_line_item_entity_1.AuditScopeLineItem),
    (0, typeorm_1.JoinColumn)({ name: 'line_item_id' }),
    __metadata("design:type", audit_scope_line_item_entity_1.AuditScopeLineItem)
], CorrectiveActionPlan.prototype, "lineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CorrectiveActionStatus,
        default: CorrectiveActionStatus.PENDING,
    }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CorrectiveActionPriority,
        default: CorrectiveActionPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CorrectiveActionPlan.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completion_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CorrectiveActionPlan.prototype, "completionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], CorrectiveActionPlan.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CorrectiveActionPlan.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", user_entity_1.User)
], CorrectiveActionPlan.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CorrectiveActionPlan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CorrectiveActionPlan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CorrectiveActionPlan.prototype, "deletedAt", void 0);
exports.CorrectiveActionPlan = CorrectiveActionPlan = __decorate([
    (0, typeorm_1.Entity)('corrective_action_plans')
], CorrectiveActionPlan);
//# sourceMappingURL=corrective-action-plan.entity.js.map