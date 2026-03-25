import { StreamableFile } from '@nestjs/common';
import { ClientReportsService } from './reports.service';
import { SubmitReportFeedbackDto } from './dto/submit-feedback.dto';
export declare class ClientReportsController {
    private readonly service;
    constructor(service: ClientReportsService);
    findAll(req: any): Promise<import("../../database/entities/audit-report.entity").AuditReport[]>;
    findOne(id: string, req: any): Promise<import("../../database/entities/audit-report.entity").AuditReport>;
    submitFeedback(id: string, dto: SubmitReportFeedbackDto, req: any): Promise<{
        message: string;
    }>;
    download(id: string, req: any, res: any): Promise<StreamableFile>;
}
