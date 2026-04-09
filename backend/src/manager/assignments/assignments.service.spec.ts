import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ManagerAssignmentsService } from './assignments.service';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditorLineItemAssignment } from '../../database/entities/auditor-line-item-assignment.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

describe('ManagerAssignmentsService', () => {
  let service: ManagerAssignmentsService;
  let module: TestingModule;
  let auditRepo: any;
  let buAssignmentRepo: any;
  let liAssignmentRepo: any;
  let mappingRepo: any;
  let abuRepo: any;
  let scopeRepo: any;

  const mockAudit = {
    id: 'audit-1',
    name: 'Test Audit',
    status: AuditStatus.DRAFT,
    managerId: 'mgr-1',
  };

  const mockAuditor = { id: 'auditor-1', fullName: 'Auditor One' };
  const mockABU = { id: 'abu-1', auditId: 'audit-1', businessUnit: { name: 'BU 1' } };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ManagerAssignmentsService,
        {
          provide: getRepositoryToken(AuditorAuditAssignment),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((val) => val),
            save: jest.fn().mockImplementation((val) => Promise.resolve({ id: 'asgn-1', ...val })),
            softRemove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(AuditorLineItemAssignment),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((val) => val),
            save: jest.fn().mockImplementation((val) => Promise.resolve({ id: 'li-asgn-1', ...val })),
            softRemove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(Audit),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockAudit),
          },
        },
        {
          provide: getRepositoryToken(AuditBusinessUnit),
          useValue: {
            find: jest.fn().mockResolvedValue([mockABU]),
            findOne: jest.fn().mockResolvedValue(mockABU),
          },
        },
        {
          provide: getRepositoryToken(AuditScopeLineItem),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ManagerAuditorMapping),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 'map-1' }),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: AuditTrailService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ManagerAssignmentsService>(ManagerAssignmentsService);
    auditRepo = module.get(getRepositoryToken(Audit));
    buAssignmentRepo = module.get(getRepositoryToken(AuditorAuditAssignment));
    liAssignmentRepo = module.get(getRepositoryToken(AuditorLineItemAssignment));
    mappingRepo = module.get(getRepositoryToken(ManagerAuditorMapping));
    abuRepo = module.get(getRepositoryToken(AuditBusinessUnit));
    scopeRepo = module.get(getRepositoryToken(AuditScopeLineItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignToBU', () => {
    const dto = { auditorId: 'auditor-1', auditBusinessUnitId: 'abu-1' };

    it('should assign auditor to BU and log trail and notify', async () => {
      const notificationsService = module.get(NotificationsService);
      const result = await service.assignToBU('audit-1', dto, 'mgr-1');
      expect(result).toBeDefined();
      expect(buAssignmentRepo.save).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalledWith(expect.objectContaining({
        type: NotificationType.AUDIT_ASSIGNED,
      }));
    });

    it('should throw UnprocessableEntityException if audit not in draft', async () => {
      auditRepo.findOne.mockResolvedValue({ ...mockAudit, status: AuditStatus.IN_PROGRESS });
      await expect(service.assignToBU('audit-1', dto, 'mgr-1')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if auditor not mapped', async () => {
      mappingRepo.findOne.mockResolvedValue(null);
      await expect(service.assignToBU('audit-1', dto, 'mgr-1')).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('unassignFromBU', () => {
    it('should soft delete the assignment', async () => {
      buAssignmentRepo.findOne.mockResolvedValue({ id: 'asgn-1', auditId: 'audit-1' });
      await service.unassignFromBU('audit-1', 'asgn-1', 'mgr-1');
      expect(buAssignmentRepo.softRemove).toHaveBeenCalled();
    });
  });

  describe('assignToLineItem', () => {
    const dto = { auditorId: 'auditor-1', lineItemId: 'li-1' };

    it('should assign auditor to line item', async () => {
      scopeRepo.findOne.mockResolvedValue({ id: 'li-1', auditId: 'audit-1' });
      const result = await service.assignToLineItem('audit-1', dto, 'mgr-1');
      expect(result).toBeDefined();
      expect(liAssignmentRepo.save).toHaveBeenCalled();
    });
  });

  describe('getAssignments', () => {
    it('should return assignments data including auditors and availableAuditors', async () => {
      const mockBUAssignment = {
        auditorId: 'auditor-1',
        auditor: { id: 'auditor-1', fullName: 'Auditor One' },
        auditBusinessUnitId: 'abu-1',
      };
      const mockMapping = {
        auditorId: 'auditor-1',
        auditor: { id: 'auditor-1', fullName: 'Auditor One' },
      };

      buAssignmentRepo.find.mockResolvedValue([mockBUAssignment]);
      mappingRepo.find.mockResolvedValue([mockMapping]);

      const result = await service.getAssignments('audit-1');

      expect(result.auditors).toHaveLength(1);
      expect(result.auditors[0].id).toBe('auditor-1');
      expect(result.availableAuditors).toHaveLength(1);
      expect(result.availableAuditors[0].id).toBe('auditor-1');
      expect(result.lineItemAssignments).toBeDefined();
    });
  });
});
