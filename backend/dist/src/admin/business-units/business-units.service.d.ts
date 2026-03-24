import { Repository } from 'typeorm';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import { Audit } from '../../database/entities/audit.entity';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class AdminBusinessUnitsService {
    private readonly repository;
    private readonly auditRepository;
    private readonly auditTrailService;
    private readonly logger;
    constructor(repository: Repository<BusinessUnit>, auditRepository: Repository<Audit>, auditTrailService: AuditTrailService);
    create(clientId: string, createDto: CreateBusinessUnitDto, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<BusinessUnit>;
    findAllByClient(clientId: string): Promise<BusinessUnit[]>;
    findOne(clientId: string, id: string): Promise<BusinessUnit>;
    update(clientId: string, id: string, updateDto: UpdateBusinessUnitDto, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<BusinessUnit>;
    remove(clientId: string, id: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
}
