import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repository.create(dto);
    return await this.repository.save(notification);
  }

  async findAllForUser(userId: string, query: GetNotificationsDto): Promise<{ data: Notification[], meta: any }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', isRead } = query;
    const skip = (page - 1) * limit;

    const targetUserId = typeof userId === 'object' ? (userId as any).id : userId;
    const where: any = { userId: targetUserId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const sortProperty = sortBy === 'created_at' ? 'createdAt' : sortBy;
    const [data, total] = await this.repository.findAndCount({
      where,
      order: { [sortProperty]: sortOrder },
      take: limit,
      skip,
    });

    const unreadCount = await this.repository.count({
      where: { userId: targetUserId, isRead: false },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repository.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.repository.update({ userId, isRead: false }, { isRead: true });
    return result.affected || 0;
  }
}