import { Repository } from 'typeorm';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class AdminMappingsService {
    private readonly managerAuditorRepo;
    private readonly managerClientRepo;
    private readonly auditTrailService;
    private readonly logger;
    constructor(managerAuditorRepo: Repository<ManagerAuditorMapping>, managerClientRepo: Repository<ManagerClientMapping>, auditTrailService: AuditTrailService);
    addManagerAuditorMapping(dto: CreateMappingDto, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
    removeManagerAuditorMapping(managerId: string, auditorId: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
    addManagerClientMapping(dto: CreateMappingDto, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
    removeManagerClientMapping(managerId: string, clientId: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
}
