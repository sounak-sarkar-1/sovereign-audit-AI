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
export declare class NotificationsService {
    private readonly repository;
    private readonly logger;
    constructor(repository: Repository<Notification>);
    create(dto: CreateNotificationDto): Promise<Notification>;
    findAllForUser(userId: string, query: GetNotificationsDto): Promise<{
        data: Notification[];
        meta: any;
    }>;
    markAsRead(id: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<number>;
}
export {};
