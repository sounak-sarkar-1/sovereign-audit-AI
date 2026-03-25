import { Repository } from 'typeorm';
import { CorrectiveActionPlan } from '../../database/entities/corrective-action-plan.entity';
import { User } from '../../database/entities/user.entity';
export declare class ClientCorrectiveActionsService {
    private readonly repo;
    constructor(repo: Repository<CorrectiveActionPlan>);
    findAll(clientId: string, auditId?: string): Promise<CorrectiveActionPlan[]>;
    findOne(id: string, clientId: string): Promise<CorrectiveActionPlan>;
    create(user: User, data: any): Promise<CorrectiveActionPlan[]>;
    update(id: string, clientId: string, data: any): Promise<CorrectiveActionPlan>;
    delete(id: string, clientId: string): Promise<CorrectiveActionPlan>;
}
