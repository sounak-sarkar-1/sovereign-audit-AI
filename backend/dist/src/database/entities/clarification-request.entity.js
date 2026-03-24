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
exports.ClarificationRequest = exports.ClarificationStatus = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const user_entity_1 = require("./user.entity");
const exception_request_entity_1 = require("./exception-request.entity");
const clarification_response_entity_1 = require("./clarification-response.entity");
var ClarificationStatus;
(function (ClarificationStatus) {
    ClarificationStatus["PENDING"] = "pending";
    ClarificationStatus["RESPONDED"] = "responded";
    ClarificationStatus["CLOSED"] = "closed";
})(ClarificationStatus || (exports.ClarificationStatus = ClarificationStatus = {}));
let ClarificationRequest = class ClarificationRequest {
};
exports.ClarificationRequest = ClarificationRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], ClarificationRequest.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], ClarificationRequest.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], ClarificationRequest.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ClarificationStatus,
        default: ClarificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_exception_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClarificationRequest.prototype, "relatedExceptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exception_request_entity_1.ExceptionRequest),
    (0, typeorm_1.JoinColumn)({ name: 'related_exception_id' }),
    __metadata("design:type", exception_request_entity_1.ExceptionRequest)
], ClarificationRequest.prototype, "relatedException", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => clarification_response_entity_1.ClarificationResponse, (response) => response.clarificationRequest),
    __metadata("design:type", Array)
], ClarificationRequest.prototype, "responses", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClarificationRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClarificationRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ClarificationRequest.prototype, "deletedAt", void 0);
exports.ClarificationRequest = ClarificationRequest = __decorate([
    (0, typeorm_1.Entity)('clarification_requests')
], ClarificationRequest);
//# sourceMappingURL=clarification-request.entity.js.map