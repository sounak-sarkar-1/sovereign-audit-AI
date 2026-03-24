import { OnModuleInit } from '@nestjs/common';
import { AiJobsService } from '../ai-jobs.service';
import { Repository, DataSource } from 'typeorm';
import { AiJob } from '../../../database/entities/ai-job.entity';
import { AuditReport } from '../../../database/entities/audit-report.entity';
import { Audit } from '../../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest } from '../../../database/entities/exception-request.entity';
import { FilesService } from '../../files/files.service';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class ReportGenerationWorker implements OnModuleInit {
    private readonly aiJobsService;
    private readonly aiJobRepo;
    private readonly reportRepo;
    private readonly auditRepo;
    private readonly lineItemRepo;
    private readonly exceptionRepo;
    private readonly filesService;
    private readonly notificationsService;
    private readonly dataSource;
    private readonly logger;
    constructor(aiJobsService: AiJobsService, aiJobRepo: Repository<AiJob>, reportRepo: Repository<AuditReport>, auditRepo: Repository<Audit>, lineItemRepo: Repository<AuditScopeLineItem>, exceptionRepo: Repository<ExceptionRequest>, filesService: FilesService, notificationsService: NotificationsService, dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private handleJob;
}
