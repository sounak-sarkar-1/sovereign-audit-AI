import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HeatmapService } from './heatmap.service';
import { User } from '../../database/entities/user.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';

describe('HeatmapService', () => {
  let service: HeatmapService;
  let mappingRepo: any;
  let assignmentRepo: any;
  let scopeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeatmapService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ManagerAuditorMapping),
          useValue: {
            find: jest.fn().mockResolvedValue([
              { auditor: { id: 'aud-1', fullName: 'Auditor 1', email: 'aud1@test.com' } }
            ]),
          },
        },
        {
          provide: getRepositoryToken(AuditorAuditAssignment),
          useValue: {
            find: jest.fn().mockResolvedValue([
              { 
                auditorId: 'aud-1', 
                auditId: 'audit-1',
                audit: { id: 'audit-1', name: 'Audit 1' },
                auditBusinessUnitId: 'abu-1',
                auditBusinessUnit: { 
                  businessUnit: { name: 'BU 1' } 
                }
              }
            ]),
          },
        },
        {
          provide: getRepositoryToken(AuditScopeLineItem),
          useValue: {
            find: jest.fn().mockResolvedValue([
              { id: 'li-1', status: 'not_started' },
              { id: 'li-2', status: 'submitted' },
            ]),
          },
        },
        {
          provide: getRepositoryToken(Audit),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HeatmapService>(HeatmapService);
    mappingRepo = module.get(getRepositoryToken(ManagerAuditorMapping));
    assignmentRepo = module.get(getRepositoryToken(AuditorAuditAssignment));
    scopeRepo = module.get(getRepositoryToken(AuditScopeLineItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHeatmap', () => {
    it('should return aggregated heatmap data', async () => {
      const result = await service.getHeatmap('mgr-1');
      expect(result.kpis).toBeDefined();
      expect(result.auditors).toHaveLength(1);
      expect(result.auditors[0].breakdown).toHaveLength(1);
      expect(result.auditors[0].breakdown[0].openItems).toBe(1);
      expect(result.auditors[0].breakdown[0].totalItems).toBe(2);
    });
  });
});
