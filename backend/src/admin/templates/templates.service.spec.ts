import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TemplatesService } from './templates.service';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repo: any;
  let dataSource: any;
  let auditTrailService: any;

  const mockQueryResult = {
    connect: jest.fn().mockResolvedValue(null),
    startTransaction: jest.fn().mockResolvedValue(null),
    commitTransaction: jest.fn().mockResolvedValue(null),
    rollbackTransaction: jest.fn().mockResolvedValue(null),
    release: jest.fn().mockResolvedValue(null),
    manager: {
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'uuid', ...entity })),
      create: jest.fn().mockImplementation((cls, data) => ({ ...data })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    },
  };

  beforeEach(async () => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'uuid', ...data })),
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryResult),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    };

    auditTrailService = {
      log: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getRepositoryToken(AuditTemplate),
          useValue: repo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: AuditTrailService,
          useValue: auditTrailService,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll(1, 10);
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(repo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a template if found', async () => {
      const mockTemplate = { id: 'uuid', name: 'Test' };
      repo.findOne.mockResolvedValue(mockTemplate);
      const result = await service.findOne('uuid');
      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a template with line items and options in a transaction', async () => {
      const dto = {
        name: 'New Template',
        lineItems: [
          {
            name: 'Item 1',
            description: 'Desc',
            inputMethod: 'multiple_choice' as any,
            options: [{ optionText: 'Opt 1' }],
          },
        ],
      };

      repo.findOne.mockResolvedValue({ id: 'uuid', name: dto.name });
      const result = await service.create(dto, 'user-id');

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryResult.startTransaction).toHaveBeenCalled();
      expect(mockQueryResult.manager.save).toHaveBeenCalled();
      expect(mockQueryResult.commitTransaction).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockQueryResult.manager.save.mockRejectedValueOnce(new Error('DB Error'));
      const dto = { name: 'Fail', lineItems: [] };

      await expect(service.create(dto, 'user-id')).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryResult.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete template and items', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid', name: 'To Delete' });
      const result = await service.remove('uuid', 'user-id');
      expect(result.message).toBe('Template deleted successfully');
      expect(repo.save).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });
  });
});
