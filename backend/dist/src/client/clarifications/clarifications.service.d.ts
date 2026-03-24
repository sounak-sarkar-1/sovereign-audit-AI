import { Repository } from 'typeorm';
import { ClarificationRequest } from '../../database/entities/clarification-request.entity';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
import { User } from '../../database/entities/user.entity';
export declare class ClientClarificationsService {
    private readonly clarificationRepo;
    private readonly responseRepo;
    private readonly notificationsService;
    private readonly logger;
    constructor(clarificationRepo: Repository<ClarificationRequest>, responseRepo: Repository<ClarificationResponse>, notificationsService: NotificationsService);
    respond(id: string, dto: RespondToClarificationDto, user: User): Promise<ClarificationResponse>;
}
