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
exports.Audit = exports.AuditStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["DRAFT"] = "draft";
    AuditStatus["IN_PROGRESS"] = "in_progress";
    AuditStatus["UNDER_MANAGER_REVIEW"] = "under_manager_review";
    AuditStatus["PENDING_CLIENT_REVIEW"] = "pending_client_review";
    AuditStatus["CLOSED"] = "closed";
    AuditStatus["REOPENED"] = "reopened";
    AuditStatus["DELETED"] = "deleted";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
let Audit = class Audit {
};
exports.Audit = Audit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Audit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Audit.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'uuid' }),
    __metadata("design:type", String)
], Audit.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Audit.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'uuid' }),
    __metadata("design:type", String)
], Audit.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Audit.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AuditStatus,
        default: AuditStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Audit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_completion_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "expectedCompletionDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Audit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Audit.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "deletedAt", void 0);
exports.Audit = Audit = __decorate([
    (0, typeorm_1.Entity)('audits')
], Audit);
//# sourceMappingURL=audit.entity.js.map