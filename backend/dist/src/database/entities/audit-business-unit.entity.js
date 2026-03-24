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
exports.AuditBusinessUnit = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const business_unit_entity_1 = require("./business-unit.entity");
let AuditBusinessUnit = class AuditBusinessUnit {
};
exports.AuditBusinessUnit = AuditBusinessUnit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditBusinessUnit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditBusinessUnit.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], AuditBusinessUnit.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_unit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditBusinessUnit.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_unit_entity_1.BusinessUnit),
    (0, typeorm_1.JoinColumn)({ name: 'business_unit_id' }),
    __metadata("design:type", business_unit_entity_1.BusinessUnit)
], AuditBusinessUnit.prototype, "businessUnit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditBusinessUnit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AuditBusinessUnit.prototype, "deletedAt", void 0);
exports.AuditBusinessUnit = AuditBusinessUnit = __decorate([
    (0, typeorm_1.Entity)('audit_business_units'),
    (0, typeorm_1.Unique)(['auditId', 'businessUnitId'])
], AuditBusinessUnit);
//# sourceMappingURL=audit-business-unit.entity.js.map