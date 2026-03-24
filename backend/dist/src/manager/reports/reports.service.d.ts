import { Repository, DataSource } from 'typeorm';
import { Audit } from '../../database/entities/audit.entity';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AiJob } from '../../database/entities/ai-job.entity';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { User } from '../../database/entities/user.entity';
export declare class ManagerReportsService {
    private readonly auditRepo;
    private readonly reportRepo;
    private readonly lineItemRepo;
    private readonly aiJobRepo;
    private readonly aiJobsService;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly dataSource;
    private readonly logger;
    constructor(auditRepo: Repository<Audit>, reportRepo: Repository<AuditReport>, lineItemRepo: Repository<AuditScopeLineItem>, aiJobRepo: Repository<AiJob>, aiJobsService: AiJobsService, notificationsService: NotificationsService, auditTrailService: AuditTrailService, dataSource: DataSource);
    generate(auditId: string, manager: User): Promise<{
        reportId: string;
        jobId: string;
    }>;
    findAll(auditId: string): Promise<AuditReport[]>;
    sendToClient(auditId: string, reportId: string, manager: User): Promise<{
        message: string;
    }>;
    finalize(auditId: string, reportId: string, manager: User): Promise<{
        message: string;
    }>;
}
