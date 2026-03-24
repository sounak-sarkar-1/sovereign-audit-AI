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
exports.AuditTrailLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let AuditTrailLog = class AuditTrailLog {
};
exports.AuditTrailLog = AuditTrailLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_user_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "actorUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'actor_user_id' }),
    __metadata("design:type", user_entity_1.User)
], AuditTrailLog.prototype, "actorUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_role', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "actorRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_type', type: 'varchar' }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', type: 'varchar' }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditTrailLog.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'inet', nullable: true }),
    __metadata("design:type", String)
], AuditTrailLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuditTrailLog.prototype, "createdAt", void 0);
exports.AuditTrailLog = AuditTrailLog = __decorate([
    (0, typeorm_1.Entity)('audit_trail_logs')
], AuditTrailLog);
//# sourceMappingURL=audit-trail-log.entity.js.map