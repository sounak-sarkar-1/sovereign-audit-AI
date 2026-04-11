"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ManagerScopeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerScopeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = require("exceljs");
const audit_scope_line_item_entity_1 = require("../../database/entities/audit-scope-line-item.entity");
const audit_scope_line_item_option_entity_1 = require("../../database/entities/audit-scope-line-item-option.entity");
const audit_business_unit_entity_1 = require("../../database/entities/audit-business-unit.entity");
const audit_template_entity_1 = require("../../database/entities/audit-template.entity");
const ai_job_entity_1 = require("../../database/entities/ai-job.entity");
const import_session_entity_1 = require("../../database/entities/import-session.entity");
const files_service_1 = require("../../shared/files/files.service");
const ai_jobs_service_1 = require("../../shared/ai-jobs/ai-jobs.service");
const uploaded_file_entity_1 = require("../../database/entities/uploaded-file.entity");
let ManagerScopeService = ManagerScopeService_1 = class ManagerScopeService {
    constructor(scopeRepository, abuRepository, templateRepository, aiJobRepository, importSessionRepository, filesService, aiJobsService, dataSource) {
        this.scopeRepository = scopeRepository;
        this.abuRepository = abuRepository;
        this.templateRepository = templateRepository;
        this.aiJobRepository = aiJobRepository;
        this.importSessionRepository = importSessionRepository;
        this.filesService = filesService;
        this.aiJobsService = aiJobsService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ManagerScopeService_1.name);
    }
    async findAll(auditId) {
        const items = await this.scopeRepository.find({
            where: { auditId },
            relations: [
                'options',
                'auditBusinessUnit',
                'auditBusinessUnit.businessUnit',
            ],
            order: { displayOrder: 'ASC' },
        });
        return items.reduce((acc, item) => {
            const buId = item.auditBusinessUnitId;
            if (!acc[buId])
                acc[buId] = [];
            acc[buId].push(item);
            return acc;
        }, {});
    }
    async createLineItems(auditId, dto) {
        const abu = await this.abuRepository.findOne({
            where: { id: dto.auditBusinessUnitId, auditId },
        });
        if (!abu) {
            throw new common_1.NotFoundException(`Business Unit mapping not found for this audit. Received BU ID: ${dto.auditBusinessUnitId}`);
        }
        return await this.dataSource.transaction(async (manager) => {
            const createdItems = [];
            for (const itemDto of dto.items) {
                const item = manager.create(audit_scope_line_item_entity_1.AuditScopeLineItem, {
                    auditId,
                    auditBusinessUnitId: dto.auditBusinessUnitId,
                    name: itemDto.name,
                    description: itemDto.description,
                    inputMethod: itemDto.inputMethod,
                    isOptional: itemDto.isOptional ?? false,
                    displayOrder: itemDto.displayOrder ?? 0,
                    source: audit_scope_line_item_entity_1.LineItemSource.MANUAL,
                    status: audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED,
                });
                const savedItem = await manager.save(item);
                if (itemDto.options && itemDto.options.length > 0) {
                    const options = itemDto.options.map((opt, index) => manager.create(audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, {
                        lineItemId: savedItem.id,
                        optionText: opt,
                        displayOrder: index,
                    }));
                    await manager.save(options);
                }
                createdItems.push(savedItem);
            }
            return createdItems;
        });
    }
    async updateLineItem(auditId, itemId, dto) {
        const item = await this.scopeRepository.findOne({
            where: { id: itemId, auditId },
        });
        if (!item)
            throw new common_1.NotFoundException('Scope item not found');
        if ([audit_scope_line_item_entity_1.LineItemStatus.SUBMITTED, audit_scope_line_item_entity_1.LineItemStatus.EXCEPTION_APPROVED].includes(item.status)) {
            throw new common_1.UnprocessableEntityException('Cannot update submitted or exception-approved item');
        }
        return await this.dataSource.transaction(async (manager) => {
            if (dto.options !== undefined) {
                await manager.delete(audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, { lineItemId: itemId });
                if (dto.options.length > 0) {
                    const options = dto.options.map((opt, index) => manager.create(audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, {
                        lineItemId: itemId,
                        optionText: opt,
                        displayOrder: index,
                    }));
                    await manager.save(options);
                }
            }
            Object.assign(item, dto);
            return await manager.save(item);
        });
    }
    async removeLineItem(auditId, itemId) {
        const item = await this.scopeRepository.findOne({
            where: { id: itemId, auditId },
            relations: ['audit'],
        });
        if (!item)
            throw new common_1.NotFoundException('Scope item not found');
        if (item.audit.status !== 'draft' &&
            item.status !== audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED) {
            throw new common_1.UnprocessableEntityException('Cannot delete item in an active audit unless it is not started');
        }
        return await this.scopeRepository.softRemove(item);
    }
    async importFromTemplate(auditId, dto) {
        const templates = await this.templateRepository.find({
            where: { id: (0, typeorm_2.In)(dto.templateIds) },
            relations: ['lineItems', 'lineItems.options'],
        });
        return await this.dataSource.transaction(async (manager) => {
            const importedItems = [];
            for (const template of templates) {
                if (!template.lineItems)
                    continue;
                for (const tplItem of template.lineItems) {
                    const newItem = manager.create(audit_scope_line_item_entity_1.AuditScopeLineItem, {
                        auditId,
                        auditBusinessUnitId: dto.auditBusinessUnitId,
                        name: tplItem.name,
                        description: tplItem.description,
                        inputMethod: tplItem.inputMethod,
                        isOptional: tplItem.isOptional,
                        displayOrder: tplItem.displayOrder,
                        source: audit_scope_line_item_entity_1.LineItemSource.TEMPLATE,
                        status: audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED,
                    });
                    const savedItem = await manager.save(newItem);
                    if (tplItem.options && tplItem.options.length > 0) {
                        const options = tplItem.options.map((opt) => manager.create(audit_scope_line_item_option_entity_1.AuditScopeLineItemOption, {
                            lineItemId: savedItem.id,
                            optionText: opt.optionText,
                            displayOrder: opt.displayOrder,
                        }));
                        await manager.save(options);
                    }
                    importedItems.push(savedItem);
                }
            }
            return importedItems;
        });
    }
    async extractFromDocument(auditId, file, buId, userId) {
        const uploadedFile = await this.filesService.uploadFile(file, userId, uploaded_file_entity_1.FileEntityType.SOP_DOCUMENT, auditId);
        const job = this.aiJobRepository.create({
            jobType: ai_job_entity_1.JobType.SCOPE_EXTRACTION,
            status: ai_job_entity_1.JobStatus.QUEUED,
            inputPayload: {
                fileId: uploadedFile.id,
                auditBusinessUnitId: buId,
            },
            auditId,
            createdBy: userId,
        });
        const savedJob = await this.aiJobRepository.save(job);
        await this.aiJobsService.send('scope-extraction', {
            jobId: savedJob.id,
        });
        return { jobId: savedJob.id };
    }
    async importFromExcel(auditId, file, buId) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet)
            throw new common_1.UnprocessableEntityException('No worksheet found in Excel');
        const rows = [];
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            headers.push({
                columnLetter: headerRow.getCell(colNumber).address.replace(/[0-9]/g, ''),
                headerText: cell.text,
            });
        });
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const rowData = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const colLetter = row.getCell(colNumber).address.replace(/[0-9]/g, '');
                rowData[colLetter] = cell.text;
            });
            rows.push(rowData);
        });
        const session = this.importSessionRepository.create({
            data: {
                rows,
                meta: { auditBusinessUnitId: buId },
            },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });
        const savedSession = await this.importSessionRepository.save(session);
        return {
            importId: savedSession.id,
            detectedColumns: headers,
        };
    }
    async confirmExcelImport(auditId, importId, dto) {
        const session = await this.importSessionRepository.findOne({
            where: { id: importId },
        });
        if (!session)
            throw new common_1.NotFoundException('Import session not found');
        if (session.expiresAt && session.expiresAt < new Date())
            throw new common_1.UnprocessableEntityException('Import session expired');
        const { rows, meta } = session.data || {};
        const buId = meta?.auditBusinessUnitId;
        if (!Array.isArray(rows)) {
            throw new common_1.UnprocessableEntityException('Invalid session data');
        }
        const { columnMapping } = dto;
        return await this.dataSource.transaction(async (manager) => {
            const createdItems = [];
            for (const row of rows) {
                const name = row[columnMapping.nameColumn];
                const description = row[columnMapping.descriptionColumn];
                if (!name)
                    continue;
                let inputMethod = audit_scope_line_item_entity_1.InputMethod.FREE_TEXT;
                if (columnMapping.inputMethodColumn) {
                    const val = row[columnMapping.inputMethodColumn]?.toLowerCase();
                    if (val?.includes('multiple') || val?.includes('choice')) {
                        inputMethod = audit_scope_line_item_entity_1.InputMethod.MULTIPLE_CHOICE;
                    }
                }
                const item = manager.create(audit_scope_line_item_entity_1.AuditScopeLineItem, {
                    auditId,
                    auditBusinessUnitId: buId,
                    name,
                    description: description || name,
                    inputMethod,
                    isOptional: false,
                    source: audit_scope_line_item_entity_1.LineItemSource.EXCEL_IMPORTED,
                    status: audit_scope_line_item_entity_1.LineItemStatus.NOT_STARTED,
                });
                createdItems.push(await manager.save(item));
            }
            return createdItems;
        });
    }
};
exports.ManagerScopeService = ManagerScopeService;
exports.ManagerScopeService = ManagerScopeService = ManagerScopeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_scope_line_item_entity_1.AuditScopeLineItem)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_business_unit_entity_1.AuditBusinessUnit)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_template_entity_1.AuditTemplate)),
    __param(3, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __param(4, (0, typeorm_1.InjectRepository)(import_session_entity_1.ImportSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService,
        ai_jobs_service_1.AiJobsService,
        typeorm_2.DataSource])
], ManagerScopeService);
//# sourceMappingURL=scope.service.js.map