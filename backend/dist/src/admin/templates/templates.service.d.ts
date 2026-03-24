import { Repository, DataSource } from 'typeorm';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class TemplatesService {
    private templateRepo;
    private dataSource;
    private auditTrailService;
    constructor(templateRepo: Repository<AuditTemplate>, dataSource: DataSource, auditTrailService: AuditTrailService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        items: AuditTemplate[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<AuditTemplate>;
    create(createDto: CreateTemplateDto, userId: string): Promise<AuditTemplate>;
    update(id: string, updateDto: UpdateTemplateDto, userId: string): Promise<AuditTemplate>;
    remove(id: string, userId: string): Promise<{
        message: string;
        warningCount: number;
    }>;
}
