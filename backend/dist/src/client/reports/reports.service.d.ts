import { Repository, DataSource } from 'typeorm';
import { AuditReport } from '../../database/entities/audit-report.entity';
import { Audit } from '../../database/entities/audit.entity';
import { SubmitReportFeedbackDto } from './dto/submit-feedback.dto';
import { NotificationsService } from '../../shared/notifications/notifications.service';
export declare class ClientReportsService {
    private readonly reportRepo;
    private readonly auditRepo;
    private readonly notificationsService;
    private readonly dataSource;
    private readonly logger;
    constructor(reportRepo: Repository<AuditReport>, auditRepo: Repository<Audit>, notificationsService: NotificationsService, dataSource: DataSource);
    findAll(clientId: string): Promise<AuditReport[]>;
    findOne(id: string, clientId: string): Promise<AuditReport>;
    submitFeedback(id: string, dto: SubmitReportFeedbackDto, clientId: string): Promise<{
        message: string;
    }>;
    download(id: string, clientId: string): Promise<import("../../database/entities/uploaded-file.entity").UploadedFile>;
}
