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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminAiModelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAiModelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const ai_model_entity_1 = require("../../database/entities/ai-model.entity");
const encryption_util_1 = require("../../common/utils/encryption.util");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let AdminAiModelsService = AdminAiModelsService_1 = class AdminAiModelsService {
    constructor(repository, configService, auditTrailService, dataSource) {
        this.repository = repository;
        this.configService = configService;
        this.auditTrailService = auditTrailService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AdminAiModelsService_1.name);
        this.encryptionKey = this.configService.get('encryption.aesKey') || '';
        if (!this.encryptionKey) {
            this.logger.warn('AES_ENCRYPTION_KEY not found in configuration');
        }
    }
    async create(createDto, creatorId, actor) {
        const apiKeyEnc = encryption_util_1.EncryptionUtils.encrypt(createDto.apiKey, this.encryptionKey);
        const { apiKey, ...rest } = createDto;
        const model = this.repository.create({
            ...rest,
            apiKeyEnc,
            createdBy: creatorId,
            isActive: false,
        });
        const savedModel = await this.repository.save(model);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.AUDIT_CREATED,
            entityType: 'ai_models',
            entityId: savedModel.id,
            metadata: { name: savedModel.name, type: savedModel.modelType },
            ipAddress: actor.ip,
        });
        return savedModel;
    }
    async findAll() {
        return await this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const model = await this.repository.findOne({ where: { id } });
        if (!model) {
            throw new common_1.NotFoundException(`AI Model with ID "${id}" not found`);
        }
        return model;
    }
    async update(id, updateDto, actor) {
        const model = await this.findOne(id);
        const { apiKey, ...rest } = updateDto;
        if (apiKey) {
            model.apiKeyEnc = encryption_util_1.EncryptionUtils.encrypt(apiKey, this.encryptionKey);
        }
        Object.assign(model, rest);
        const updatedModel = await this.repository.save(model);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'ai_models',
            entityId: updatedModel.id,
            metadata: { name: updatedModel.name },
            ipAddress: actor.ip,
        });
        return updatedModel;
    }
    async activate(id, actor) {
        const model = await this.findOne(id);
        await this.dataSource.transaction(async (manager) => {
            await manager.update(ai_model_entity_1.AiModel, { id: (0, typeorm_3.Not)((0, typeorm_3.In)([id])) }, { isActive: false });
            await manager.update(ai_model_entity_1.AiModel, { id }, { isActive: true });
        });
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_UPDATED,
            entityType: 'ai_models',
            entityId: id,
            metadata: { active: true },
            ipAddress: actor.ip,
        });
    }
    async remove(id, actor) {
        const model = await this.findOne(id);
        if (model.isActive) {
            throw new common_1.UnprocessableEntityException('Cannot delete an active AI Model');
        }
        await this.repository.softRemove(model);
        await this.auditTrailService.log({
            actorId: actor.id,
            actorRole: actor.role,
            action: audit_trail_service_1.AuditAction.USER_DELETED,
            entityType: 'ai_models',
            entityId: id,
            ipAddress: actor.ip,
        });
    }
    async testConnection(id) {
        const model = await this.findOne(id);
        const apiKey = encryption_util_1.EncryptionUtils.decrypt(model.apiKeyEnc, this.encryptionKey);
        try {
            const response = await axios_1.default.get(model.endpointUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'X-API-Key': apiKey,
                },
                timeout: 5000,
                validateStatus: () => true,
            });
            if (response.status >= 200 && response.status < 500) {
                return { success: true, message: `Connected successfully (Status: ${response.status})` };
            }
            else {
                return { success: false, message: `Connection failed with status ${response.status}` };
            }
        }
        catch (error) {
            this.logger.error(`Test connection failed for model ${id}: ${error.message}`);
            return { success: false, message: `Connection error: ${error.message}` };
        }
    }
};
exports.AdminAiModelsService = AdminAiModelsService;
exports.AdminAiModelsService = AdminAiModelsService = AdminAiModelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_model_entity_1.AiModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        audit_trail_service_1.AuditTrailService,
        typeorm_2.DataSource])
], AdminAiModelsService);
const typeorm_3 = require("typeorm");
//# sourceMappingURL=ai-models.service.js.map