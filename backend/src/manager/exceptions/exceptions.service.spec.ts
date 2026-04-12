import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ManagerExceptionsService } from './exceptions.service';
import {
  ExceptionRequest,
  ExceptionStatus,
} from '../../database/entities/exception-request.entity';
import {
  AuditScopeLineItem,
  LineItemStatus,
} from '../../database/entities/audit-scope-line-item.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { User } from '../../database/entities/user.entity';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('ManagerExceptionsService', () => {
  let service: ManagerExceptionsService;
  let exceptionRepo: any;
  let lineItemRepo: any;
  let notificationsService: any;
  let auditTrailService: any;
  let dataSource: any;

  const mockManager = { id: 'mgr-1', role: 'manager' } as any;
  const mockAuditorId = 'aud-1';
  const mockAuditId = 'audit-1';

  beforeEach(async () => {
    exceptionRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
    };
    lineItemRepo = {
      save: jest.fn(),
    };
    notificationsService = {
      create: jest.fn(),
    };
    auditTrailService = {
      log: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((cb) => cb({ save: jest.fn() })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerExceptionsService,
        {
          provide: getRepositoryToken(ExceptionRequest),
          useValue: exceptionRepo,
        },
        {
          provide: getRepositoryToken(AuditScopeLineItem),
          useValue: lineItemRepo,
        },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuditTrailService, useValue: auditTrailService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ManagerExceptionsService>(ManagerExceptionsService);
  });

  describe('approve', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should approve a pending exception', async () => {
      const mockException = {
        id: 'ex-1',
        status: ExceptionStatus.PENDING,
        auditorId: mockAuditorId,
        auditScopeLineItem: {
          id: 'li-1',
          name: 'Line Item 1',
          auditId: mockAuditId,
        },
      };

      exceptionRepo.findOne.mockResolvedValue(mockException);

      const saveFn = jest.fn();
      dataSource.transaction.mockImplementation(async (cb) => {
        await cb({ save: saveFn });
      });

      await service.approve(
        'ex-1',
        { managerComment: 'Looks good' },
        mockManager,
      );

      expect(mockException.status).toBe(ExceptionStatus.APPROVED);
      expect(mockException.managerComment).toBe('Looks good');
      expect(saveFn).toHaveBeenCalledWith(mockException);
      expect(notificationsService.create).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exception does not exist', async () => {
      exceptionRepo.findOne.mockResolvedValue(null);
      await expect(service.approve('ex-1', {}, mockManager)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException if exception is not pending', async () => {
      exceptionRepo.findOne.mockResolvedValue({
        status: ExceptionStatus.APPROVED,
      });
      await expect(service.approve('ex-1', {}, mockManager)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending exception', async () => {
      const mockException = {
        id: 'ex-1',
        status: ExceptionStatus.PENDING,
        auditorId: mockAuditorId,
        auditScopeLineItem: {
          id: 'li-1',
          name: 'Line Item 1',
          auditId: mockAuditId,
        },
      };

      exceptionRepo.findOne.mockResolvedValue(mockException);

      const saveFn = jest.fn();
      dataSource.transaction.mockImplementation(async (cb) => {
        await cb({ save: saveFn });
      });

      await service.reject(
        'ex-1',
        { managerComment: 'Not enough evidence' },
        mockManager,
      );

      expect(mockException.status).toBe(ExceptionStatus.REJECTED);
      expect(saveFn).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalled();
      expect(auditTrailService.log).toHaveBeenCalled();
    });
  });
});
