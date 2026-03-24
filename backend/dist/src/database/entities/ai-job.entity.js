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
exports.AiJob = exports.JobStatus = exports.JobType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_entity_1 = require("./audit.entity");
var JobType;
(function (JobType) {
    JobType["SCOPE_EXTRACTION"] = "scope_extraction";
    JobType["REPORT_GENERATION"] = "report_generation";
    JobType["NL_SEARCH"] = "nl_search";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "queued";
    JobStatus["PROCESSING"] = "processing";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
let AiJob = class AiJob {
};
exports.AiJob = AiJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'job_type',
        type: 'enum',
        enum: JobType,
    }),
    __metadata("design:type", String)
], AiJob.prototype, "jobType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.QUEUED,
    }),
    __metadata("design:type", String)
], AiJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'input_payload', type: 'jsonb' }),
    __metadata("design:type", Object)
], AiJob.prototype, "inputPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'output_payload', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AiJob.prototype, "outputPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiJob.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AiJob.prototype, "auditId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => audit_entity_1.Audit),
    (0, typeorm_1.JoinColumn)({ name: 'audit_id' }),
    __metadata("design:type", audit_entity_1.Audit)
], AiJob.prototype, "audit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], AiJob.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], AiJob.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiJob.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AiJob.prototype, "completedAt", void 0);
exports.AiJob = AiJob = __decorate([
    (0, typeorm_1.Entity)('ai_jobs')
], AiJob);
//# sourceMappingURL=ai-job.entity.js.map