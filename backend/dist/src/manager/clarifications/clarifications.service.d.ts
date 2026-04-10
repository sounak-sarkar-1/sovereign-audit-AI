import { Repository } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
import { CreateClarificationDto } from './dto/create-clarification.dto';
import { User } from '../../database/entities/user.entity';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class ManagerClarificationsService {
    private readonly clarificationRepo;
    private readonly exceptionRepo;
    private readonly responseRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly logger;
    constructor(clarificationRepo: Repository<ClarificationRequest>, exceptionRepo: Repository<ExceptionRequest>, responseRepo: Repository<ClarificationResponse>, notificationsService: NotificationsService, auditTrailService: AuditTrailService);
    respond(id: string, message: string, manager: User): Promise<ClarificationResponse>;
    findAll(status?: ClarificationStatus, manager?: User): Promise<ClarificationRequest[]>;
    findOne(id: string): Promise<ClarificationRequest>;
    close(id: string, manager: User): Promise<{
        message: string;
    }>;
    create(dto: CreateClarificationDto, manager: User): Promise<ClarificationRequest>;
}
