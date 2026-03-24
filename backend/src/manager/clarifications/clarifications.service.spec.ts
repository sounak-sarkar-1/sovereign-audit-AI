import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ManagerClarificationsService } from './clarifications.service';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { User } from '../../database/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 'mgr-1', role: 'manager' } as any;

describe('ManagerClarificationsService', () => {
  let service: ManagerClarificationsService;
  let clarificationRepo: any;
  let exceptionRepo: any;
  let notificationsService: any;
  let auditTrailService: any;

  beforeEach(async () => {
    clarificationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    exceptionRepo = {
      findOne: jest.fn(),
    };

    notificationsService = {
      create: jest.fn(),
    };

    auditTrailService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerClarificationsService,
        { provide: getRepositoryToken(ClarificationRequest), useValue: clarificationRepo },
        { provide: getRepositoryToken(ExceptionRequest), useValue: exceptionRepo },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditTrailService, useValue: auditTrailService },
      ],
    }).compile();

    service = module.get<ManagerClarificationsService>(ManagerClarificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should fetch all clarifications with filters', async () => {
      const mockResult = [{ id: '1' }] as any;
      clarificationRepo.createQueryBuilder().getMany.mockResolvedValue(mockResult);

      const result = await service.findAll(ClarificationStatus.PENDING, mockUser);

      expect(result).toEqual(mockResult);
      expect(clarificationRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should fetch a single thread with relations', async () => {
      const mockResult = { id: '1', responses: [] } as any;
      clarificationRepo.findOne.mockResolvedValue(mockResult);

      const result = await service.findOne('1');

      expect(result).toEqual(mockResult);
      expect(clarificationRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '1' } }));
    });

    it('should throw NotFoundException if not found', async () => {
      clarificationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('should mark status as closed and log audit trail', async () => {
      const mockThread = { id: '1', status: ClarificationStatus.RESPONDED, auditId: 'audit-1' } as any;
      clarificationRepo.findOne.mockResolvedValue(mockThread);
      clarificationRepo.save.mockResolvedValue(mockThread);

      const result = await service.close('1', mockUser);

      expect(result.message).toBe('Clarification thread closed');
      expect(mockThread.status).toBe(ClarificationStatus.CLOSED);
      expect(auditTrailService.log).toHaveBeenCalled();
    });
  });
});
