import { ClientAuditsService } from './audits.service';
import { AuditStatus } from '../../database/entities/audit.entity';
export declare class ClientAuditsController {
    private readonly service;
    constructor(service: ClientAuditsService);
    findAll(req: any, page?: number, limit?: number, status?: AuditStatus): Promise<{
        data: import("../../database/entities/audit.entity").Audit[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        data: import("../../database/entities/audit.entity").Audit;
    }>;
}
