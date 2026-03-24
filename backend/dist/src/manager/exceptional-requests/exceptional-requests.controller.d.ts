import { ManagerExceptionalRequestsService } from './exceptional-requests.service';
import { User } from '../../database/entities/user.entity';
import { ExceptionalActionType } from '../../database/entities/exceptional-action-request.entity';
declare class CreateExceptionalRequestDto {
    actionType: ExceptionalActionType;
    justification: string;
}
export declare class ManagerExceptionalRequestsController {
    private readonly service;
    constructor(service: ManagerExceptionalRequestsService);
    create(auditId: string, dto: CreateExceptionalRequestDto, manager: User): Promise<import("../../database/entities/exceptional-action-request.entity").ExceptionalActionRequest>;
}
export {};
