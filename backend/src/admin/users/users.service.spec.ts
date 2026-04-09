import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { AdminUsersService } from './users.service';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let repository: any;

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Audit),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AuditorAuditAssignment),
          useValue: {},
        },
        {
          provide: AuditTrailService,
          useValue: { log: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should search by name and email using OR condition', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const query = { search: 'John', role: UserRole.AUDITOR };

      await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: [
          { role: UserRole.AUDITOR, email: Like('%John%') },
          { role: UserRole.AUDITOR, fullName: Like('%John%') },
        ],
      }));
    });

    it('should return users whose fullName contains "John"', async () => {
      const mockUsers = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
        { id: '2', fullName: 'Johnny Silver', email: 'silver@example.com' },
      ];
      mockRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll({ search: 'John' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].fullName).toContain('John');
      expect(result.data[1].fullName).toContain('John');
    });
  });
});
