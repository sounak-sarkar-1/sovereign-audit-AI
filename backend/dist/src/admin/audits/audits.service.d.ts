import { Repository } from 'typeorm';
import { Audit } from '../../database/entities/audit.entity';
import { AuditFilterDto } from './dto/audit-filter.dto';
export declare class AdminAuditsService {
    private readonly auditRepository;
    private readonly logger;
    constructor(auditRepository: Repository<Audit>);
    findAll(filters: AuditFilterDto): Promise<Audit[]>;
    exportCsv(filters: AuditFilterDto): Promise<string>;
}
