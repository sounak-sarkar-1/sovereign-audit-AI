import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ManagerExceptionalRequestsService } from './exceptional-requests.service';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest, ExceptionalActionType, ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';

describe('ManagerExceptionalRequestsService', () => {
  let service: ManagerExceptionalRequestsService;
  let auditRepo: any;
  let requestRepo: any;
  let userRepo: any;
  let notificationsService: any;
  let auditTrailService: any;

  const mockManager = { id: 'mgr-1', tenantId: 'tenant-1', role: 'manager', fullName: 'John Mgr' } as any;

  beforeEach(async () => {
    auditRepo = {
      findOne: jest.fn(),
    };
    requestRepo = {
      findOne: jest.fn(),
      create: jest.fn(val => val),
      save: jest.fn(val => ({ ...val, id: 'req-1' })),
    };
    userRepo = {
      find: jest.fn(),
    };
    notificationsService = {
      create: jest.fn(),
    };
    auditTrailService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerExceptionalRequestsService,
        { provide: getRepositoryToken(Audit), useValue: auditRepo },
        { provide: getRepositoryToken(ExceptionalActionRequest), useValue: requestRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditTrailService, useValue: auditTrailService },
      ],
    }).compile();

    service = module.get<ManagerExceptionalRequestsService>(ManagerExceptionalRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if audit not found', async () => {
      auditRepo.findOne.mockResolvedValue(null);
      await expect(service.create('a1', {}, mockManager)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException if delete requested for closed audit', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'a1', status: AuditStatus.CLOSED });
      await expect(service.create('a1', { actionType: ExceptionalActionType.DELETE }, mockManager))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if reopen requested for draft audit', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'a1', status: AuditStatus.DRAFT });
      await expect(service.create('a1', { actionType: ExceptionalActionType.REOPEN }, mockManager))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw error if pending request already exists', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'a1', status: AuditStatus.IN_PROGRESS });
      requestRepo.findOne.mockResolvedValue({ id: 'req-old' });

      await expect(service.create('a1', { actionType: ExceptionalActionType.DELETE }, mockManager))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should create request and notify admins', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'a1', status: AuditStatus.IN_PROGRESS, name: 'Audit 1' });
      requestRepo.findOne.mockResolvedValue(null);
      userRepo.find.mockResolvedValue([{ id: 'adm-1' }]);

      const result = await service.create('a1', { 
        actionType: ExceptionalActionType.DELETE, 
        justification: 'Accidental creation' 
      }, mockManager);

      expect(result).toBeDefined();
      expect(notificationsService.create).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });
  });
});
