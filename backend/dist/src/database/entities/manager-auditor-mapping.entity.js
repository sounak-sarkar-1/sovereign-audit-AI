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
exports.ManagerAuditorMapping = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let ManagerAuditorMapping = class ManagerAuditorMapping {
};
exports.ManagerAuditorMapping = ManagerAuditorMapping;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ManagerAuditorMapping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'uuid' }),
    __metadata("design:type", String)
], ManagerAuditorMapping.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auditor_id', type: 'uuid' }),
    __metadata("design:type", String)
], ManagerAuditorMapping.prototype, "auditorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], ManagerAuditorMapping.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'auditor_id' }),
    __metadata("design:type", user_entity_1.User)
], ManagerAuditorMapping.prototype, "auditor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ManagerAuditorMapping.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ManagerAuditorMapping.prototype, "deletedAt", void 0);
exports.ManagerAuditorMapping = ManagerAuditorMapping = __decorate([
    (0, typeorm_1.Entity)('manager_auditor_mappings'),
    (0, typeorm_1.Unique)(['managerId', 'auditorId'])
], ManagerAuditorMapping);
//# sourceMappingURL=manager-auditor-mapping.entity.js.map