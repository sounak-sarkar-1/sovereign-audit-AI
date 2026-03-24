import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        items: import("../../database/entities/audit-template.entity").AuditTemplate[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("../../database/entities/audit-template.entity").AuditTemplate>;
    create(createDto: CreateTemplateDto, req: any): Promise<import("../../database/entities/audit-template.entity").AuditTemplate>;
    update(id: string, updateDto: UpdateTemplateDto, req: any): Promise<import("../../database/entities/audit-template.entity").AuditTemplate>;
    remove(id: string, req: any): Promise<{
        message: string;
        warningCount: number;
    }>;
}
