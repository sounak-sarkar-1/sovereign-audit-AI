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
exports.AuditReport = exports.ReportStatus = void 0;
const typeorm_1 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
const uploaded_file_entity_1 = require("./uploaded-file.entity");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["SENT_FOR_CLIENT_REVIEW"] = "sent_for_client_review";
    ReportStatus["FINAL"] = "final";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let AuditReport = class AuditReport {
};
exports.AuditReport = AuditReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid' }),
    __metadata("design:type", String)
], AuditReport.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], AuditReport.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AuditReport.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => uploaded_file_entity_1.UploadedFile),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", uploaded_file_entity_1.UploadedFile)
], AuditReport.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], AuditReport.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.DRAFT,
    }),
    __metadata("design:type", String)
], AuditReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AuditReport.prototype, "managerNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditReport.prototype, "updatedAt", void 0);
exports.AuditReport = AuditReport = __decorate([
    (0, typeorm_1.Entity)('audit_reports')
], AuditReport);
//# sourceMappingURL=audit-report.entity.js.map