import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminExceptionalRequestsService } from './exceptional-requests.service';
import {
  ExceptionalActionRequest,
  ExceptionalRequestStatus,
  ExceptionalActionType,
} from '../../database/entities/exceptional-action-request.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { FilesService } from '../../shared/files/files.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminExceptionalRequestsService', () => {
  let service: AdminExceptionalRequestsService;
  let requestRepository: Repository<ExceptionalActionRequest>;
  let auditRepository: Repository<Audit>;
  let auditTrailRepository: Repository<AuditTrailLog>;
  let filesService: FilesService;
  let notificationsService: NotificationsService;

  const mockRequestRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditTrailRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockFilesService = {
    uploadFile: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminExceptionalRequestsService,
        {
          provide: getRepositoryToken(ExceptionalActionRequest),
          useValue: mockRequestRepository,
        },
        {
          provide: getRepositoryToken(Audit),
          useValue: mockAuditRepository,
        },
        {
          provide: getRepositoryToken(AuditTrailLog),
          useValue: mockAuditTrailRepository,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AdminExceptionalRequestsService>(
      AdminExceptionalRequestsService,
    );
    requestRepository = module.get<Repository<ExceptionalActionRequest>>(
      getRepositoryToken(ExceptionalActionRequest),
    );
    auditRepository = module.get<Repository<Audit>>(getRepositoryToken(Audit));
    auditTrailRepository = module.get<Repository<AuditTrailLog>>(
      getRepositoryToken(AuditTrailLog),
    );
    filesService = module.get<FilesService>(FilesService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all requests when no status is provided', async () => {
      const mockRequests = [{ id: '1' }, { id: '2' }] as any[];
      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.findAll();

      expect(result).toEqual(mockRequests);
      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['audit', 'requester', 'audit.client'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by status', async () => {
      mockRequestRepository.find.mockResolvedValue([]);
      await service.findAll(ExceptionalRequestStatus.PENDING);
      expect(mockRequestRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ExceptionalRequestStatus.PENDING },
        }),
      );
    });
  });

  describe('approve', () => {
    const mockId = 'req-123';
    const mockAdminId = 'admin-456';
    const mockFile = { originalname: 'evidence.pdf' } as any;
    const mockAuditId = 'audit-789';

    let mockRequest: any;
    const mockAudit = {
      id: mockAuditId,
      name: 'Test Audit',
      status: AuditStatus.IN_PROGRESS,
    } as any;

    beforeEach(() => {
      mockRequest = {
        id: mockId,
        auditId: mockAuditId,
        status: ExceptionalRequestStatus.PENDING,
        actionType: ExceptionalActionType.DELETE,
        requestedById: 'manager-001',
      } as any;
      mockAudit.status = AuditStatus.IN_PROGRESS;
      mockAudit.deletedAt = undefined;
    });

    it('should throw NotFoundException if request does not exist', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);
      await expect(
        service.approve(mockId, mockAdminId, mockFile),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if request is not pending', async () => {
      mockRequestRepository.findOne.mockResolvedValue({
        ...mockRequest,
        status: ExceptionalRequestStatus.APPROVED,
      });
      await expect(
        service.approve(mockId, mockAdminId, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully approve a delete request', async () => {
      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockAuditRepository.findOne.mockResolvedValue(mockAudit);
      mockFilesService.uploadFile.mockResolvedValue({ id: 'file-1' });
      mockAuditTrailRepository.create.mockReturnValue({});

      const result = await service.approve(
        mockId,
        mockAdminId,
        mockFile,
        'Approved justification',
      );

      expect(mockFilesService.uploadFile).toHaveBeenCalled();
      expect(mockRequest.status).toBe(ExceptionalRequestStatus.APPROVED);
      expect(mockRequest.evidenceFileId).toBe('file-1');
      expect(mockAuditRepository.save).toHaveBeenCalled();
      expect(mockAuditTrailRepository.save).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalled();
      expect(result).toEqual(mockRequest);
    });

    it('should successfully approve a reopen request', async () => {
      const reopenRequest = {
        ...mockRequest,
        actionType: ExceptionalActionType.REOPEN,
      };
      mockRequestRepository.findOne.mockResolvedValue(reopenRequest);
      mockAuditRepository.findOne.mockResolvedValue(mockAudit);
      mockFilesService.uploadFile.mockResolvedValue({ id: 'file-2' });
      mockAuditTrailRepository.create.mockReturnValue({});

      await service.approve(mockId, mockAdminId, mockFile);

      expect(mockAudit.status).toBe(AuditStatus.REOPENED);
      expect(mockAudit.deletedAt).toBeNull();
    });
  });

  describe('reject', () => {
    it('should reject a request', async () => {
      const mockRequest = {
        id: '1',
        status: ExceptionalRequestStatus.PENDING,
        requestedById: 'm1',
      } as any;
      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await service.reject('1', 'admin-1', 'Reason');

      expect(mockRequest.status).toBe(ExceptionalRequestStatus.REJECTED);
      expect(mockRequest.adminComment).toBe('Reason');
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });
  });
});
