import { Repository } from 'typeorm';
import { Audit } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class ManagerExceptionalRequestsService {
    private readonly auditRepo;
    private readonly requestRepo;
    private readonly userRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly logger;
    constructor(auditRepo: Repository<Audit>, requestRepo: Repository<ExceptionalActionRequest>, userRepo: Repository<User>, notificationsService: NotificationsService, auditTrailService: AuditTrailService);
    create(auditId: string, dto: any, manager: User): Promise<ExceptionalActionRequest>;
}
