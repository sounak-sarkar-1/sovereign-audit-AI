import { ManagerScopeService } from './scope.service';
import { User } from '../../database/entities/user.entity';
import { CreateScopeItemsDto } from './dto/create-scope-items.dto';
import { UpdateScopeItemDto } from './dto/update-scope-item.dto';
import { ImportFromTemplateDto } from './dto/import-from-template.dto';
import { ConfirmExcelImportDto } from './dto/confirm-excel-import.dto';
export declare class ManagerScopeController {
    private readonly service;
    constructor(service: ManagerScopeService);
    findAll(auditId: string): Promise<Record<string, import("../../database/entities/audit-scope-line-item.entity").AuditScopeLineItem[]>>;
    create(auditId: string, dto: CreateScopeItemsDto): Promise<any[]>;
    createBatch(auditId: string, dto: CreateScopeItemsDto): Promise<any[]>;
    update(auditId: string, lineItemId: string, dto: UpdateScopeItemDto): Promise<import("../../database/entities/audit-scope-line-item.entity").AuditScopeLineItem>;
    remove(auditId: string, lineItemId: string): Promise<import("../../database/entities/audit-scope-line-item.entity").AuditScopeLineItem>;
    importFromTemplate(auditId: string, dto: ImportFromTemplateDto): Promise<any[]>;
    extractFromDocument(auditId: string, file: Express.Multer.File, buId: string, user: User): Promise<{
        jobId: string;
    }>;
    importFromExcel(auditId: string, file: Express.Multer.File, buId: string): Promise<{
        importId: string;
        detectedColumns: any[];
    }>;
    confirmExcelImport(auditId: string, importId: string, dto: ConfirmExcelImportDto): Promise<any[]>;
}
