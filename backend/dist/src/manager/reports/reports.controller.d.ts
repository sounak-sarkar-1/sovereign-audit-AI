import { ManagerReportsService } from './reports.service';
import { User } from '../../database/entities/user.entity';
import { Response } from 'express';
export declare class ManagerReportsController {
    private readonly service;
    constructor(service: ManagerReportsService);
    generate(auditId: string, manager: User): Promise<{
        reportId: string;
        jobId: string;
    }>;
    findAll(auditId: string): Promise<import("../../database/entities/audit-report.entity").AuditReport[]>;
    sendToClient(auditId: string, reportId: string, manager: User): Promise<{
        message: string;
    }>;
    finalize(auditId: string, reportId: string, manager: User): Promise<{
        message: string;
    }>;
    download(auditId: string, reportId: string, res: Response): Promise<void>;
    upload(auditId: string, reportId: string, file: Express.Multer.File, manager: User): Promise<import("../../database/entities/audit-report.entity").AuditReport>;
}
