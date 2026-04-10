import { Response } from 'express';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
export declare class AdminAuditTrailController {
    private readonly service;
    constructor(service: AuditTrailService);
    findAll(page?: number, limit?: number, action?: AuditAction, entityType?: string, actorId?: string, search?: string, startDate?: string, endDate?: string): Promise<{
        data: import("../../database/entities/audit-trail-log.entity").AuditTrailLog[];
        meta: any;
    }>;
    export(res: Response, format?: 'csv' | 'json', startDate?: string, endDate?: string): Promise<Response<any, Record<string, any>>>;
}
