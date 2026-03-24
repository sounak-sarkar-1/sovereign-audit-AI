import { AdminExceptionalRequestsService } from './exceptional-requests.service';
import { ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';
export declare class AdminExceptionalRequestsController {
    private readonly service;
    constructor(service: AdminExceptionalRequestsService);
    findAll(status?: ExceptionalRequestStatus): Promise<import("../../database/entities/exceptional-action-request.entity").ExceptionalActionRequest[]>;
    findOne(id: string): Promise<import("../../database/entities/exceptional-action-request.entity").ExceptionalActionRequest>;
    approve(id: string, req: any, file: Express.Multer.File, adminComment?: string): Promise<import("../../database/entities/exceptional-action-request.entity").ExceptionalActionRequest>;
    reject(id: string, req: any, adminComment: string): Promise<import("../../database/entities/exceptional-action-request.entity").ExceptionalActionRequest>;
}
