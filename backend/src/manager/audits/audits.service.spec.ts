import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ManagerAuditsService } from './audits.service';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

describe('ManagerAuditsService', () => {
  let service: ManagerAuditsService;
  let module: TestingModule;
  let auditRepo: any;
  let managerClientRepo: any;
  let assignmentRepo: any;
  let dataSource: any;
  let queryRunner: any;

  const mockAudit = {
    id: 'audit-1',
    name: 'Test Audit',
    status: AuditStatus.DRAFT,
    managerId: 'mgr-1',
    clientId: 'client-1',
    startDate: new Date(),
    expectedCompletionDate: new Date(Date.now() + 86400000),
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
        create: jest.fn().mockImplementation((cls, val) => ({ ...val })),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      query: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        ManagerAuditsService,
        {
          provide: getRepositoryToken(Audit),
          useValue: {
            create: jest.fn().mockReturnValue(mockAudit),
            save: jest.fn().mockResolvedValue(mockAudit),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockAudit], 1]),
            }),
          },
        },
        {
          provide: getRepositoryToken(AuditBusinessUnit),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockImplementation((val) => ({ ...val })),
          },
        },
        {
          provide: getRepositoryToken(ManagerClientMapping),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AuditorAuditAssignment),
          useValue: {
            count: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ count: '1' }),
            }),
          },
        },
        {
          provide: getRepositoryToken(BusinessUnit),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: getRepositoryToken(ExceptionalActionRequest),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: AuditTrailService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ManagerAuditsService>(ManagerAuditsService);
    auditRepo = module.get(getRepositoryToken(Audit));
    managerClientRepo = module.get(getRepositoryToken(ManagerClientMapping));
    assignmentRepo = module.get(getRepositoryToken(AuditorAuditAssignment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated audits with stats', async () => {
      dataSource.query.mockResolvedValueOnce([{ total: '10', completed: '5' }]); // for completionPercentage
      dataSource.query.mockResolvedValueOnce([{ count: '2' }]); // for openExceptionsCount

      const result = await service.findAll('mgr-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].completionPercentage).toBe(50);
      expect(result.items[0].openExceptionsCount).toBe(2);
      expect(result.items[0]).toHaveProperty('auditorCount');
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated name' };
    
    it('should update audit and log action', async () => {
      auditRepo.findOne.mockResolvedValue(mockAudit);
      auditRepo.save.mockResolvedValue({ ...mockAudit, ...updateDto });
      // mock findOne which is called at the end of update()
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockAudit, ...updateDto } as any);

      const auditTrailService = module.get(AuditTrailService);
      const logSpy = jest.spyOn(auditTrailService, 'log');

      await service.update('audit-1', updateDto, 'mgr-1');

      expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({
        action: AuditAction.AUDIT_UPDATED,
      }));
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Audit',
      clientId: 'client-1',
      businessUnitIds: ['bu-1'],
      startDate: new Date(Date.now() + 86400000).toISOString(),
      expectedCompletionDate: new Date(Date.now() + 172800000).toISOString(),
    };

    it('should throw BadRequestException if client not mapped', async () => {
      managerClientRepo.findOne.mockResolvedValue(null);
      await expect(service.create(createDto, 'mgr-1')).rejects.toThrow(BadRequestException);
    });

    it('should create audit and link BUs', async () => {
      managerClientRepo.findOne.mockResolvedValue({ id: 'mapping-1' });
      auditRepo.findOne.mockResolvedValue(mockAudit); // for the final findOne call
      
      const result = await service.create(createDto, 'mgr-1');
      
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('start', () => {
    it('should throw BadRequestException if no scope items', async () => {
      auditRepo.findOne.mockResolvedValue(mockAudit);
      dataSource.query.mockResolvedValue([{ count: '0' }]);
      
      await expect(service.start('audit-1', 'mgr-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no auditors assigned', async () => {
      auditRepo.findOne.mockResolvedValue(mockAudit);
      dataSource.query.mockResolvedValue([{ count: '5' }]);
      assignmentRepo.count.mockResolvedValue(0);
      
      await expect(service.start('audit-1', 'mgr-1')).rejects.toThrow(BadRequestException);
    });

    it('should transition to in_progress', async () => {
      auditRepo.findOne.mockResolvedValue(mockAudit);
      dataSource.query.mockResolvedValue([{ count: '5' }]);
      assignmentRepo.count.mockResolvedValue(1);
      
      const result = await service.start('audit-1', 'mgr-1');
      expect(mockAudit.status).toBe(AuditStatus.IN_PROGRESS);
    });
  });

  describe('archive', () => {
    it('should throw UnprocessableEntityException if audit is not closed', async () => {
      const draftAudit = { ...mockAudit, status: AuditStatus.DRAFT };
      auditRepo.findOne.mockResolvedValue(draftAudit);
      
      await expect(service.archive('audit-1', 'mgr-1')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should transition to archived if audit is closed', async () => {
      const closedAudit = { ...mockAudit, status: AuditStatus.CLOSED };
      auditRepo.findOne.mockResolvedValue(closedAudit);
      auditRepo.save.mockImplementation((val) => Promise.resolve(val));
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...closedAudit, status: AuditStatus.ARCHIVED } as any);
      
      const result = await service.archive('audit-1', 'mgr-1');
      expect(result.status).toBe(AuditStatus.ARCHIVED);
      
      const auditTrailService = module.get(AuditTrailService);
      expect(auditTrailService.log).toHaveBeenCalledWith(expect.objectContaining({
        action: AuditAction.AUDIT_ARCHIVED,
      }));
    });
  });
});
