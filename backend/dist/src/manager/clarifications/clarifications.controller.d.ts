import { ManagerClarificationsService } from './clarifications.service';
import { CreateClarificationDto } from './dto/create-clarification.dto';
import { User } from '../../database/entities/user.entity';
import { ClarificationStatus } from '../../database/entities/clarification-request.entity';
export declare class ManagerClarificationsController {
    private readonly service;
    constructor(service: ManagerClarificationsService);
    findAll(status?: ClarificationStatus, manager?: User): Promise<import("../../database/entities/clarification-request.entity").ClarificationRequest[]>;
    findOne(id: string): Promise<import("../../database/entities/clarification-request.entity").ClarificationRequest>;
    close(id: string, manager: User): Promise<{
        message: string;
    }>;
    create(auditId: string, dto: CreateClarificationDto, manager: User): Promise<import("../../database/entities/clarification-request.entity").ClarificationRequest>;
    respond(id: string, message: string, manager: User): Promise<import("../../database/entities/clarification-response.entity").ClarificationResponse>;
}
