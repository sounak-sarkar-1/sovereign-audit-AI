import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditsService } from './audits.service';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditFilterDto } from './dto/audit-filter.dto';

describe('AdminAuditsService', () => {
  let service: AdminAuditsService;
  let auditRepository: Repository<Audit>;

  const mockAuditRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditsService,
        {
          provide: getRepositoryToken(Audit),
          useValue: mockAuditRepository,
        },
      ],
    }).compile();

    service = module.get<AdminAuditsService>(AdminAuditsService);
    auditRepository = module.get<Repository<Audit>>(getRepositoryToken(Audit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should apply filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAuditRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters: AuditFilterDto = {
        search: 'test',
        status: AuditStatus.CLOSED,
        clientId: 'client-1',
      };

      await service.findAll(filters);

      expect(mockAuditRepository.createQueryBuilder).toHaveBeenCalledWith('audit');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.name ILIKE :search', { search: '%test%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.status = :status', { status: AuditStatus.CLOSED });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.clientId = :clientId', { clientId: 'client-1' });
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('exportCsv', () => {
    it('should generate CSV with headers and rows', async () => {
      const mockAudits = [
        {
          id: '1',
          name: 'Audit 1',
          client: { fullName: 'Client A' },
          manager: { fullName: 'Manager X' },
          status: AuditStatus.IN_PROGRESS,
          createdAt: new Date('2023-01-01'),
        },
      ] as any[];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockAudits);

      const csv = await service.exportCsv({});

      expect(csv).toContain('Audit ID,Name,Client,Manager,Status');
      expect(csv).toContain('"1","Audit 1","Client A","Manager X","in_progress"');
    });
  });
});
