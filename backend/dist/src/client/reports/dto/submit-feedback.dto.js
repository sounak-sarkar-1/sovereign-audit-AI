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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitReportFeedbackDto = exports.SectionFeedbackDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_report_feedback_entity_1 = require("../../database/entities/client-report-feedback.entity");
class SectionFeedbackDto {
}
exports.SectionFeedbackDto = SectionFeedbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SectionFeedbackDto.prototype, "sectionName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_report_feedback_entity_1.FeedbackStatus),
    __metadata("design:type", typeof (_a = typeof client_report_feedback_entity_1.FeedbackStatus !== "undefined" && client_report_feedback_entity_1.FeedbackStatus) === "function" ? _a : Object)
], SectionFeedbackDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SectionFeedbackDto.prototype, "comment", void 0);
class SubmitReportFeedbackDto {
}
exports.SubmitReportFeedbackDto = SubmitReportFeedbackDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SectionFeedbackDto),
    __metadata("design:type", Array)
], SubmitReportFeedbackDto.prototype, "feedback", void 0);
//# sourceMappingURL=submit-feedback.dto.js.map