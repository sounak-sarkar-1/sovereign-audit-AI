import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ManagerReportsService } from './reports.service';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditReport, ReportStatus } from '../../database/entities/audit-report.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { AiJob } from '../../database/entities/ai-job.entity';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { DataSource } from 'typeorm';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';

const mockUser = { id: 'mgr-1', role: 'manager' } as any;

describe('ManagerReportsService', () => {
  let service: ManagerReportsService;
  let auditRepo: any;
  let reportRepo: any;
  let lineItemRepo: any;
  let aiJobRepo: any;
  let aiJobsService: any;
  let dataSource: any;

  beforeEach(async () => {
    auditRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    reportRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    lineItemRepo = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };
    aiJobRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    aiJobsService = {
      send: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(cb => cb({
        findOne: jest.fn(),
        create: jest.fn(val => val),
        save: jest.fn(val => ({ ...val, id: 'rep-1' })),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerReportsService,
        { provide: getRepositoryToken(Audit), useValue: auditRepo },
        { provide: getRepositoryToken(AuditReport), useValue: reportRepo },
        { provide: getRepositoryToken(AuditScopeLineItem), useValue: lineItemRepo },
        { provide: getRepositoryToken(AiJob), useValue: aiJobRepo },
        { provide: AiJobsService, useValue: aiJobsService },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
        { provide: AuditTrailService, useValue: { log: jest.fn() } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ManagerReportsService>(ManagerReportsService);
  });

  describe('generate', () => {
    it('should throw UnprocessableEntityException if mandatory items are incomplete', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'audit-1' });
      lineItemRepo.createQueryBuilder().getMany.mockResolvedValue([{ id: 'li-1' }]);

      await expect(service.generate('audit-1', mockUser)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should trigger generation if all items are complete', async () => {
      auditRepo.findOne.mockResolvedValue({ id: 'audit-1' });
      lineItemRepo.createQueryBuilder().getMany.mockResolvedValue([]);

      const result = await service.generate('audit-1', mockUser);
      expect(result).toHaveProperty('reportId');
      expect(aiJobsService.send).toHaveBeenCalledWith('report-generation', expect.anything());
    });
  });

  describe('finalize', () => {
    it('should mark audit as closed', async () => {
      const mockReport = { id: 'r-1', status: ReportStatus.SENT_FOR_CLIENT_REVIEW, audit: { id: 'a-1', managerId: 'm-1', clientId: 'c-1' } };
      reportRepo.findOne.mockResolvedValue(mockReport);

      await service.finalize('a-1', 'r-1', mockUser);

      expect(mockReport.status).toBe(ReportStatus.FINAL);
      expect(mockReport.audit.status).toBe(AuditStatus.CLOSED);
    });
  });
});
