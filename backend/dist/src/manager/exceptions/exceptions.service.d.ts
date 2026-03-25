import { Repository, DataSource } from 'typeorm';
import { ExceptionRequest, ExceptionStatus } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { ApproveExceptionDto, RejectExceptionDto } from './dto/exception-action.dto';
import { User } from '../../database/entities/user.entity';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';
export declare class ManagerExceptionsService {
    private readonly exceptionRepo;
    private readonly lineItemRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly dataSource;
    private readonly commentRepo;
    private readonly logger;
    constructor(exceptionRepo: Repository<ExceptionRequest>, lineItemRepo: Repository<AuditScopeLineItem>, notificationsService: NotificationsService, auditTrailService: AuditTrailService, dataSource: DataSource, commentRepo: Repository<ExceptionComment>);
    findAll(auditId: string, status?: ExceptionStatus): Promise<ExceptionRequest[]>;
    findAllGlobal(status?: ExceptionStatus, manager?: User): Promise<ExceptionRequest[]>;
    approve(exId: string, dto: ApproveExceptionDto, manager: User): Promise<{
        message: string;
    }>;
    reject(exId: string, dto: RejectExceptionDto, manager: User): Promise<{
        message: string;
    }>;
    getComments(exceptionId: string): Promise<ExceptionComment[]>;
    addComment(exceptionId: string, user: User, content: string): Promise<ExceptionComment>;
}
