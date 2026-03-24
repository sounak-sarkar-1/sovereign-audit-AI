import { Response } from 'express';
import { AdminAuditsService } from './audits.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
export declare class AdminAuditsController {
    private readonly service;
    constructor(service: AdminAuditsService);
    findAll(filters: AuditFilterDto): Promise<import("../../database/entities/audit.entity").Audit[]>;
    exportCsv(filters: AuditFilterDto, res: Response): Promise<void>;
}
