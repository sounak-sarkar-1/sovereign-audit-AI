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
exports.AuditorAuditAssignment = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_entity_1 = require("./audit.entity");
const audit_business_unit_entity_1 = require("./audit-business-unit.entity");
let AuditorAuditAssignment = class AuditorAuditAssignment {
};
exports.AuditorAuditAssignment = AuditorAuditAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditorAuditAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditorAuditAssignment.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], AuditorAuditAssignment.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auditor_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditorAuditAssignment.prototype, "auditorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'auditor_id' }),
    __metadata("design:type", user_entity_1.User)
], AuditorAuditAssignment.prototype, "auditor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_business_unit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditorAuditAssignment.prototype, "auditBusinessUnitId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_business_unit_entity_1.AuditBusinessUnit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_business_unit_id' }),
    __metadata("design:type", audit_business_unit_entity_1.AuditBusinessUnit)
], AuditorAuditAssignment.prototype, "auditBusinessUnit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuditorAuditAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], AuditorAuditAssignment.prototype, "deletedAt", void 0);
exports.AuditorAuditAssignment = AuditorAuditAssignment = __decorate([
    (0, typeorm_1.Entity)('auditor_audit_assignments')
], AuditorAuditAssignment);
//# sourceMappingURL=auditor-audit-assignment.entity.js.map