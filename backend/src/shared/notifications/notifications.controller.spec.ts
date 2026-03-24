import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    findAllForUser: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    markAsRead: jest.fn().mockResolvedValue(undefined),
    markAllAsRead: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAllForUser', async () => {
      const user = { id: 'user1' } as any;
      const query = { page: 1, limit: 10 };
      await controller.findAll(user, query as any);
      expect(service.findAllForUser).toHaveBeenCalledWith('user1', query);
    });
  });

  describe('markAsRead', () => {
    it('should call service.markAsRead', async () => {
      const user = { id: 'user1' } as any;
      await controller.markAsRead(user, 'notif1');
      expect(service.markAsRead).toHaveBeenCalledWith('notif1', 'user1');
    });
  });

  describe('markAllAsRead', () => {
    it('should call service.markAllAsRead', async () => {
      const user = { id: 'user1' } as any;
      await controller.markAllAsRead(user);
      expect(service.markAllAsRead).toHaveBeenCalledWith('user1');
    });
  });
});
