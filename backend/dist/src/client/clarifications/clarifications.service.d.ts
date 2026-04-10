import { Repository } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
import { UploadedFile } from '../../database/entities/uploaded-file.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
export declare class ClientClarificationsService {
    private readonly clarificationRepo;
    private readonly responseRepo;
    private readonly fileRepo;
    private readonly notificationsService;
    private readonly logger;
    constructor(clarificationRepo: Repository<ClarificationRequest>, responseRepo: Repository<ClarificationResponse>, fileRepo: Repository<UploadedFile>, notificationsService: NotificationsService);
    findAll(clientId: string, status?: ClarificationStatus): Promise<ClarificationRequest[]>;
    findOne(id: string, clientId: string): Promise<ClarificationRequest>;
    respond(id: string, clientId: string, message: string, attachmentFileIds?: string[]): Promise<ClarificationResponse>;
}
