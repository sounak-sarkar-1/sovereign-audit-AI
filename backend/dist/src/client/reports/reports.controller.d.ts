import { Response } from 'express';
import { ClientReportsService } from './reports.service';
import { User } from '../../database/entities/user.entity';
export declare class ClientReportsController {
    private readonly service;
    constructor(service: ClientReportsService);
    findAll(req: any): Promise<import("../../database/entities/audit-report.entity").AuditReport[]>;
    findOne(id: string, req: any): Promise<import("../../database/entities/audit-report.entity").AuditReport>;
    submitFeedback(reportId: string, feedback: any[], client: User): Promise<{
        message: string;
    }>;
    download(reportId: string, client: User, res: Response): Promise<void>;
}
