import { ClientCorrectiveActionsService } from './corrective-actions.service';
import { User } from '../../database/entities/user.entity';
export declare class ClientCorrectiveActionsController {
    private readonly service;
    constructor(service: ClientCorrectiveActionsService);
    findAll(clientId: string, auditId?: string): Promise<import("../../database/entities/corrective-action-plan.entity").CorrectiveActionPlan[]>;
    findOne(id: string, clientId: string): Promise<import("../../database/entities/corrective-action-plan.entity").CorrectiveActionPlan>;
    create(user: User, data: any): Promise<import("../../database/entities/corrective-action-plan.entity").CorrectiveActionPlan[]>;
    update(id: string, clientId: string, data: any): Promise<import("../../database/entities/corrective-action-plan.entity").CorrectiveActionPlan>;
    delete(id: string, clientId: string): Promise<import("../../database/entities/corrective-action-plan.entity").CorrectiveActionPlan>;
}
