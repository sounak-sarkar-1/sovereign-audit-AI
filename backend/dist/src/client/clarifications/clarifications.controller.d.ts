import { ClientClarificationsService } from './clarifications.service';
import { User } from '../../database/entities/user.entity';
import { ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
export declare class ClientClarificationsController {
    private readonly service;
    constructor(service: ClientClarificationsService);
    findAll(clientId: string, status?: ClarificationStatus): Promise<import("../../database/entities/clarification-request.entity").ClarificationRequest[]>;
    findOne(id: string, clientId: string): Promise<import("../../database/entities/clarification-request.entity").ClarificationRequest>;
    respond(id: string, dto: RespondToClarificationDto, user: User): Promise<import("../../database/entities/clarification-response.entity").ClarificationResponse>;
}
