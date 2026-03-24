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
exports.ExceptionalActionRequest = exports.ExceptionalRequestStatus = exports.ExceptionalActionType = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const user_entity_1 = require("./user.entity");
const uploaded_file_entity_1 = require("./uploaded-file.entity");
var ExceptionalActionType;
(function (ExceptionalActionType) {
    ExceptionalActionType["DELETE"] = "delete";
    ExceptionalActionType["REOPEN"] = "reopen";
})(ExceptionalActionType || (exports.ExceptionalActionType = ExceptionalActionType = {}));
var ExceptionalRequestStatus;
(function (ExceptionalRequestStatus) {
    ExceptionalRequestStatus["PENDING"] = "pending";
    ExceptionalRequestStatus["APPROVED"] = "approved";
    ExceptionalRequestStatus["REJECTED"] = "rejected";
})(ExceptionalRequestStatus || (exports.ExceptionalRequestStatus = ExceptionalRequestStatus = {}));
let ExceptionalActionRequest = class ExceptionalActionRequest {
};
exports.ExceptionalActionRequest = ExceptionalActionRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], ExceptionalActionRequest.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'action_type',
        type: 'enum',
        enum: ExceptionalActionType,
    }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "justification", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExceptionalRequestStatus,
        default: ExceptionalRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by', type: 'uuid' }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "requestedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requested_by' }),
    __metadata("design:type", user_entity_1.User)
], ExceptionalActionRequest.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ExceptionalActionRequest.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "resolvedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'resolved_by' }),
    __metadata("design:type", user_entity_1.User)
], ExceptionalActionRequest.prototype, "resolver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_file_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "evidenceFileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => uploaded_file_entity_1.UploadedFile),
    (0, typeorm_1.JoinColumn)({ name: 'evidence_file_id' }),
    __metadata("design:type", uploaded_file_entity_1.UploadedFile)
], ExceptionalActionRequest.prototype, "evidenceFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_comment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ExceptionalActionRequest.prototype, "adminComment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExceptionalActionRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExceptionalActionRequest.prototype, "updatedAt", void 0);
exports.ExceptionalActionRequest = ExceptionalActionRequest = __decorate([
    (0, typeorm_1.Entity)('exceptional_action_requests')
], ExceptionalActionRequest);
//# sourceMappingURL=exceptional-action-request.entity.js.map