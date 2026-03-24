import { Repository } from 'typeorm';
import { ExceptionalActionRequest, ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { FilesService } from '../../shared/files/files.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
export declare class AdminExceptionalRequestsService {
    private readonly requestRepository;
    private readonly auditRepository;
    private readonly auditTrailRepository;
    private readonly filesService;
    private readonly notificationsService;
    private readonly logger;
    constructor(requestRepository: Repository<ExceptionalActionRequest>, auditRepository: Repository<Audit>, auditTrailRepository: Repository<AuditTrailLog>, filesService: FilesService, notificationsService: NotificationsService);
    findAll(status?: ExceptionalRequestStatus): Promise<ExceptionalActionRequest[]>;
    findOne(id: string): Promise<ExceptionalActionRequest>;
    approve(id: string, adminId: string, file: Express.Multer.File, adminComment?: string): Promise<ExceptionalActionRequest>;
    reject(id: string, adminId: string, adminComment: string): Promise<ExceptionalActionRequest>;
}
