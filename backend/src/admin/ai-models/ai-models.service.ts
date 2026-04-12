import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiModel, AiModelType } from '../../database/entities/ai-model.entity';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { EncryptionUtils } from '../../common/utils/encryption.util';
import {
  AuditTrailService,
  AuditAction,
} from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class AdminAiModelsService {
  private readonly logger = new Logger(AdminAiModelsService.name);
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(AiModel)
    private readonly repository: Repository<AiModel>,
    private readonly configService: ConfigService,
    private readonly auditTrailService: AuditTrailService,
    private readonly dataSource: DataSource,
  ) {
    this.encryptionKey =
      this.configService.get<string>('encryption.aesKey') || '';
    if (!this.encryptionKey) {
      this.logger.warn('AES_ENCRYPTION_KEY not found in configuration');
    }
  }

  async create(
    createDto: CreateAiModelDto,
    creatorId: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<AiModel> {
    const apiKeyEnc = EncryptionUtils.encrypt(
      createDto.apiKey,
      this.encryptionKey,
    );

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
      action: AuditAction.AUDIT_CREATED, // Closest existing action
      entityType: 'ai_models',
      entityId: savedModel.id,
      metadata: { name: savedModel.name, type: savedModel.modelType },
      ipAddress: actor.ip,
    });

    return savedModel;
  }

  async findAll(): Promise<AiModel[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AiModel> {
    const model = await this.repository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`AI Model with ID "${id}" not found`);
    }
    return model;
  }

  async update(
    id: string,
    updateDto: UpdateAiModelDto,
    actor: { id: string; role: string; ip: string },
  ): Promise<AiModel> {
    const model = await this.findOne(id);

    const { apiKey, ...rest } = updateDto;

    if (apiKey) {
      model.apiKeyEnc = EncryptionUtils.encrypt(apiKey, this.encryptionKey);
    }

    Object.assign(model, rest);
    const updatedModel = await this.repository.save(model);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_UPDATED,
      entityType: 'ai_models',
      entityId: updatedModel.id,
      metadata: { name: updatedModel.name },
      ipAddress: actor.ip,
    });

    return updatedModel;
  }

  async activate(
    id: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const model = await this.findOne(id);

    // Atomic transaction to set target as active and all others as inactive
    await this.dataSource.transaction(async (manager) => {
      await manager.update(AiModel, { id: Not(In([id])) }, { isActive: false });
      await manager.update(AiModel, { id }, { isActive: true });
    });

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_UPDATED,
      entityType: 'ai_models',
      entityId: id,
      metadata: { active: true },
      ipAddress: actor.ip,
    });
  }

  async remove(
    id: string,
    actor: { id: string; role: string; ip: string },
  ): Promise<void> {
    const model = await this.findOne(id);

    if (model.isActive) {
      throw new UnprocessableEntityException(
        'Cannot delete an active AI Model',
      );
    }

    await this.repository.softRemove(model);

    await this.auditTrailService.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: AuditAction.USER_DELETED,
      entityType: 'ai_models',
      entityId: id,
      ipAddress: actor.ip,
    });
  }

  async testConnection(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const model = await this.findOne(id);
    const apiKey = EncryptionUtils.decrypt(model.apiKeyEnc, this.encryptionKey);

    try {
      // Basic health check based on model type
      // For this implementation, we'll try a generic keep-alive or a simple request
      // per model type if endpoints vary significantly.
      // Here we perform a simple HEAD or GET (depending on expectations)

      const response = await axios.get(model.endpointUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-API-Key': apiKey, // For some providers
        },
        timeout: 5000,
        validateStatus: () => true, // Accept any status to check connectivity
      });

      if (response.status >= 200 && response.status < 500) {
        return {
          success: true,
          message: `Connected successfully (Status: ${response.status})`,
        };
      } else {
        return {
          success: false,
          message: `Connection failed with status ${response.status}`,
        };
      }
    } catch (error) {
      this.logger.error(
        `Test connection failed for model ${id}: ${error.message}`,
      );
      return { success: false, message: `Connection error: ${error.message}` };
    }
  }
}

// Helpers for the transaction (Not and In are from typeorm)
import { Not, In } from 'typeorm';
