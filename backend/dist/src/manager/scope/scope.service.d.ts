import { Repository, DataSource } from 'typeorm';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { AiJob } from '../../database/entities/ai-job.entity';
import { ImportSession } from '../../database/entities/import-session.entity';
import { CreateScopeItemsDto } from './dto/create-scope-items.dto';
import { UpdateScopeItemDto } from './dto/update-scope-item.dto';
import { ImportFromTemplateDto } from './dto/import-from-template.dto';
import { ConfirmExcelImportDto } from './dto/confirm-excel-import.dto';
import { FilesService } from '../../shared/files/files.service';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
export declare class ManagerScopeService {
    private readonly scopeRepository;
    private readonly abuRepository;
    private readonly templateRepository;
    private readonly aiJobRepository;
    private readonly importSessionRepository;
    private readonly filesService;
    private readonly aiJobsService;
    private readonly dataSource;
    private readonly logger;
    constructor(scopeRepository: Repository<AuditScopeLineItem>, abuRepository: Repository<AuditBusinessUnit>, templateRepository: Repository<AuditTemplate>, aiJobRepository: Repository<AiJob>, importSessionRepository: Repository<ImportSession>, filesService: FilesService, aiJobsService: AiJobsService, dataSource: DataSource);
    findAll(auditId: string): Promise<Record<string, AuditScopeLineItem[]>>;
    createLineItems(auditId: string, dto: CreateScopeItemsDto): Promise<any[]>;
    updateLineItem(auditId: string, itemId: string, dto: UpdateScopeItemDto): Promise<AuditScopeLineItem>;
    removeLineItem(auditId: string, itemId: string): Promise<AuditScopeLineItem>;
    importFromTemplate(auditId: string, dto: ImportFromTemplateDto): Promise<any[]>;
    extractFromDocument(auditId: string, file: Express.Multer.File, buId: string, userId: string): Promise<{
        jobId: string;
    }>;
    importFromExcel(auditId: string, file: Express.Multer.File, buId: string): Promise<{
        importId: string;
        detectedColumns: any[];
    }>;
    confirmExcelImport(auditId: string, importId: string, dto: ConfirmExcelImportDto): Promise<any[]>;
}
