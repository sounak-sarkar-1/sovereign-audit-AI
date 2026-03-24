import { ClientClarificationsService } from './clarifications.service';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
import { User } from '../../database/entities/user.entity';
export declare class ClientClarificationsController {
    private readonly service;
    constructor(service: ClientClarificationsService);
    respond(id: string, dto: RespondToClarificationDto, user: User): Promise<import("../../database/entities/clarification-response.entity").ClarificationResponse>;
}
