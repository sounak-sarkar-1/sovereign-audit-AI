import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { Repository } from 'typeorm';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((notif) => Promise.resolve({ id: 'uuid', ...notif, createdAt: new Date() })),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a notification', async () => {
      const dto = {
        userId: 'user1',
        type: NotificationType.EXCEPTION_RAISED,
        title: 'Title',
        message: 'Message',
        metadata: { auditId: 'audit1' },
      };

      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.userId).toBe('user1');
      expect(result.metadata.auditId).toBe('audit1');
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated notifications and unread count', async () => {
      const userId = 'user1';
      const query = { page: 1, limit: 10 };
      
      mockRepository.findAndCount.mockResolvedValueOnce([[], 5]);
      mockRepository.count.mockResolvedValueOnce(2);

      const result = await service.findAllForUser(userId, query as any);
      
      expect(mockRepository.findAndCount).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalledWith({ where: { userId, isRead: false } });
      expect(result.meta.total).toBe(5);
      expect(result.meta.unreadCount).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      await service.markAsRead('notif1', 'user1');
      expect(mockRepository.update).toHaveBeenCalledWith({ id: 'notif1', userId: 'user1' }, { isRead: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const result = await service.markAllAsRead('user1');
      expect(mockRepository.update).toHaveBeenCalledWith({ userId: 'user1', isRead: false }, { isRead: true });
      expect(result).toBe(1);
    });
  });
});
