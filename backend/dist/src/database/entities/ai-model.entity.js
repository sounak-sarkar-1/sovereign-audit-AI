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
exports.AiModel = exports.AiModelType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AiModelType;
(function (AiModelType) {
    AiModelType["OPENAI"] = "openai";
    AiModelType["ANTHROPIC"] = "anthropic";
    AiModelType["GOOGLE"] = "google";
    AiModelType["SLM"] = "slm";
    AiModelType["OPEN_SOURCE"] = "open_source";
    AiModelType["OTHER"] = "other";
})(AiModelType || (exports.AiModelType = AiModelType = {}));
let AiModel = class AiModel {
};
exports.AiModel = AiModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AiModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AiModel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AiModelType,
        name: 'model_type'
    }),
    __metadata("design:type", String)
], AiModel.prototype, "modelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'endpoint_url' }),
    __metadata("design:type", String)
], AiModel.prototype, "endpointUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'api_key_enc' }),
    __metadata("design:type", String)
], AiModel.prototype, "apiKeyEnc", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: false }),
    __metadata("design:type", Boolean)
], AiModel.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], AiModel.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], AiModel.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiModel.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AiModel.prototype, "deletedAt", void 0);
exports.AiModel = AiModel = __decorate([
    (0, typeorm_1.Entity)('ai_models')
], AiModel);
//# sourceMappingURL=ai-model.entity.js.map