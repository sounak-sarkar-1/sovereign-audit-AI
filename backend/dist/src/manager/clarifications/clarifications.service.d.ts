import { Repository } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { CreateClarificationDto } from './dto/create-clarification.dto';
import { User } from '../../database/entities/user.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class ManagerClarificationsService {
    private readonly clarificationRepo;
    private readonly exceptionRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly logger;
    constructor(clarificationRepo: Repository<ClarificationRequest>, exceptionRepo: Repository<ExceptionRequest>, notificationsService: NotificationsService, auditTrailService: AuditTrailService);
    findAll(status?: ClarificationStatus, manager?: User): Promise<ClarificationRequest[]>;
    findOne(id: string): Promise<ClarificationRequest>;
    close(id: string, manager: User): Promise<{
        message: string;
    }>;
    create(dto: CreateClarificationDto, manager: User): Promise<ClarificationRequest>;
}
