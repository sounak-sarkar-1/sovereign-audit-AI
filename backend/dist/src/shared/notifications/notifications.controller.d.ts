import { NotificationsService } from './notifications.service';
import { User } from '../../database/entities/user.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    findAll(user: User, query: GetNotificationsDto): Promise<{
        data: import("../../database/entities/notification.entity").Notification[];
        meta: any;
    }>;
    markAsRead(user: User, id: string): Promise<{
        success: boolean;
    }>;
    markAllAsRead(user: User): Promise<{
        success: boolean;
        updatedCount: number;
    }>;
}
