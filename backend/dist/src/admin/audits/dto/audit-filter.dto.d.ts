import { AuditStatus } from '../../../database/entities/audit.entity';
export declare class AuditFilterDto {
    search?: string;
    status?: AuditStatus;
    startDate?: string;
    endDate?: string;
    clientId?: string;
    managerId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: string;
    limit?: string;
}
