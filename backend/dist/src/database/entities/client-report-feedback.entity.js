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
exports.ClientReportFeedback = exports.FeedbackStatus = void 0;
const typeorm_1 = require("typeorm");
const audit_report_entity_1 = require("./audit-report.entity");
const user_entity_1 = require("./user.entity");
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["ACCEPTED"] = "accepted";
    FeedbackStatus["REQUIRES_REVISION"] = "requires_revision";
    FeedbackStatus["NO_COMMENT"] = "no_comment";
})(FeedbackStatus || (exports.FeedbackStatus = FeedbackStatus = {}));
let ClientReportFeedback = class ClientReportFeedback {
};
exports.ClientReportFeedback = ClientReportFeedback;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "reportId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_report_entity_1.AuditReport),
    (0, typeorm_1.JoinColumn)({ name: 'report_id' }),
    __metadata("design:type", audit_report_entity_1.AuditReport)
], ClientReportFeedback.prototype, "report", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'section_name' }),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "sectionName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeedbackStatus,
        default: FeedbackStatus.NO_COMMENT,
    }),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], ClientReportFeedback.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], ClientReportFeedback.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClientReportFeedback.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ClientReportFeedback.prototype, "updatedAt", void 0);
exports.ClientReportFeedback = ClientReportFeedback = __decorate([
    (0, typeorm_1.Entity)('client_report_feedbacks')
], ClientReportFeedback);
//# sourceMappingURL=client-report-feedback.entity.js.map