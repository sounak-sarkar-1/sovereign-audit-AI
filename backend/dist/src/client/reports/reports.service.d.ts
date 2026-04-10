import { Repository, DataSource } from 'typeorm';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { Audit } from '../../database/entities/audit.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
import { FilesService } from '../../shared/files/files.service';
import { Response } from 'express';
export declare class ClientReportsService {
    private readonly reportRepo;
    private readonly auditRepo;
    private readonly notificationsService;
    private readonly auditTrailService;
    private readonly filesService;
    private readonly dataSource;
    private readonly logger;
    constructor(reportRepo: Repository<AuditReport>, auditRepo: Repository<Audit>, notificationsService: NotificationsService, auditTrailService: AuditTrailService, filesService: FilesService, dataSource: DataSource);
    findAll(clientId: string): Promise<AuditReport[]>;
    findOne(id: string, clientId: string): Promise<AuditReport>;
    submitFeedback(id: string, feedback: any[], clientId: string): Promise<{
        message: string;
    }>;
    download(reportId: string, clientId: string, res: Response): Promise<void>;
}
