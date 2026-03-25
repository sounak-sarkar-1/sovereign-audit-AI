import { Repository } from 'typeorm';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';
import { User } from '../../database/entities/user.entity';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';
import { CreateExceptionDto } from './dto/create-exception.dto';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class AuditorExceptionsService {
    private readonly exceptionRepo;
    private readonly lineItemRepo;
    private readonly auditRepo;
    private readonly fileRepo;
    private readonly auditBURepo;
    private readonly commentRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly logger;
    constructor(exceptionRepo: Repository<ExceptionRequest>, lineItemRepo: Repository<AuditScopeLineItem>, auditRepo: Repository<Audit>, fileRepo: Repository<UploadedFile>, auditBURepo: Repository<AuditBusinessUnit>, commentRepo: Repository<ExceptionComment>, notificationsService: NotificationsService, auditTrailService: AuditTrailService);
    findByAudit(auditId: string, user: User): Promise<ExceptionRequest[]>;
    findAllGlobal(user: User): Promise<ExceptionRequest[]>;
    create(auditId: string, user: User, dto: CreateExceptionDto): Promise<ExceptionRequest>;
    getComments(exceptionId: string): Promise<ExceptionComment[]>;
    addComment(exceptionId: string, user: User, content: string): Promise<ExceptionComment>;
}
