import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AdminAiModelsService } from './ai-models.service';
import { AiModel, AiModelType } from '../../database/entities/ai-model.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { EncryptionUtils } from '../../common/utils/encryption.util';
import { UnprocessableEntityException } from '@nestjs/common';

describe('AdminAiModelsService', () => {
  let service: AdminAiModelsService;
  let repository: any;
  let configService: any;
  let auditTrailService: any;
  let dataSource: any;

  const mockEncryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars for 32 bytes

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue(mockEncryptionKey),
    };

    auditTrailService = {
      log: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb({
        update: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAiModelsService,
        {
          provide: getRepositoryToken(AiModel),
          useValue: repository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: AuditTrailService,
          useValue: auditTrailService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<AdminAiModelsService>(AdminAiModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should encrypt the API key and save the model', async () => {
      const createDto = {
        name: 'Test Model',
        modelType: AiModelType.OPENAI,
        endpointUrl: 'https://api.openai.com',
        apiKey: 'sk-test-key',
      };
      const creatorId = 'user-123';
      const actor = { id: 'admin-1', role: 'admin', ip: '127.0.0.1' };

      repository.create.mockReturnValue({ id: 'model-1', ...createDto });
      repository.save.mockReturnValue({ id: 'model-1', ...createDto });

      const result = await service.create(createDto, creatorId, actor);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
      
      // Check if encryption was called (indirectly by checking repository.create call)
      const createArgs = repository.create.mock.calls[0][0];
      expect(createArgs.apiKeyEnc).toBeDefined();
      expect(createArgs.apiKeyEnc).not.toBe(createDto.apiKey);
    });
  });

  describe('encryption/decryption', () => {
    it('should correctly encrypt and decrypt a key', () => {
      const testKey = 'secret-api-key';
      const encrypted = EncryptionUtils.encrypt(testKey, mockEncryptionKey);
      const decrypted = EncryptionUtils.decrypt(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testKey);
      expect(encrypted).not.toBe(testKey);
      expect(encrypted.split(':')).toHaveLength(3);
    });
  });

  describe('activate', () => {
    it('should use a transaction to activate one model and deactivate others', async () => {
      const id = 'model-1';
      const actor = { id: 'admin-1', role: 'admin', ip: '127.0.0.1' };

      repository.findOne.mockReturnValue({ id, name: 'Model 1', isActive: false });

      await service.activate(id, actor);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw error if model is active', async () => {
      const id = 'model-1';
      const actor = { id: 'admin-1', role: 'admin', ip: '127.0.0.1' };

      repository.findOne.mockReturnValue({ id, isActive: true });

      await expect(service.remove(id, actor)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should soft delete if model is inactive', async () => {
      const id = 'model-1';
      const actor = { id: 'admin-1', role: 'admin', ip: '127.0.0.1' };

      repository.findOne.mockReturnValue({ id, isActive: false });

      await service.remove(id, actor);

      expect(repository.softRemove).toHaveBeenCalled();
    });
  });
});
