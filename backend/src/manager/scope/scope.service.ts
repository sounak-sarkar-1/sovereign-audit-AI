import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import {
  AuditScopeLineItem,
  LineItemSource,
  LineItemStatus,
  InputMethod,
} from '../../database/entities/audit-scope-line-item.entity';
import { AuditScopeLineItemOption } from '../../database/entities/audit-scope-line-item-option.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import {
  AiJob,
  JobType,
  JobStatus,
} from '../../database/entities/ai-job.entity';
import { ImportSession } from '../../database/entities/import-session.entity';
import { CreateScopeItemsDto } from './dto/create-scope-items.dto';
import { UpdateScopeItemDto } from './dto/update-scope-item.dto';
import { ImportFromTemplateDto } from './dto/import-from-template.dto';
import { ConfirmExcelImportDto } from './dto/confirm-excel-import.dto';
import { FilesService } from '../../shared/files/files.service';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { FileEntityType } from '../../database/entities/uploaded-file.entity';

@Injectable()
export class ManagerScopeService {
  private readonly logger = new Logger(ManagerScopeService.name);

  constructor(
    @InjectRepository(AuditScopeLineItem)
    private readonly scopeRepository: Repository<AuditScopeLineItem>,
    @InjectRepository(AuditBusinessUnit)
    private readonly abuRepository: Repository<AuditBusinessUnit>,
    @InjectRepository(AuditTemplate)
    private readonly templateRepository: Repository<AuditTemplate>,
    @InjectRepository(AiJob)
    private readonly aiJobRepository: Repository<AiJob>,
    @InjectRepository(ImportSession)
    private readonly importSessionRepository: Repository<ImportSession>,
    private readonly filesService: FilesService,
    private readonly aiJobsService: AiJobsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(auditId: string) {
    const items = await this.scopeRepository.find({
      where: { auditId },
      relations: [
        'options',
        'auditBusinessUnit',
        'auditBusinessUnit.businessUnit',
      ],
      order: { displayOrder: 'ASC' },
    });

    return items.reduce(
      (acc, item) => {
        const buId = item.auditBusinessUnitId;
        if (!acc[buId]) acc[buId] = [];
        acc[buId].push(item);
        return acc;
      },
      {} as Record<string, AuditScopeLineItem[]>,
    );
  }

  async createLineItems(auditId: string, dto: CreateScopeItemsDto) {
    const abu = await this.abuRepository.findOne({
      where: { id: dto.auditBusinessUnitId, auditId },
    });
    if (!abu) {
      throw new NotFoundException(
        `Business Unit mapping not found for this audit. Received BU ID: ${dto.auditBusinessUnitId}`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const createdItems = [];
      for (const itemDto of dto.items) {
        const item = manager.create(AuditScopeLineItem, {
          auditId,
          auditBusinessUnitId: dto.auditBusinessUnitId,
          name: itemDto.name,
          description: itemDto.description,
          inputMethod: itemDto.inputMethod,
          isOptional: itemDto.isOptional ?? false,
          displayOrder: itemDto.displayOrder ?? 0,
          weightage: itemDto.weightage ?? null,
          source: LineItemSource.MANUAL,
          status: LineItemStatus.NOT_STARTED,
        });

        const savedItem = await manager.save(item);

        if (itemDto.options && itemDto.options.length > 0) {
          const options = itemDto.options.map((opt, index) =>
            manager.create(AuditScopeLineItemOption, {
              lineItemId: savedItem.id,
              optionText: opt,
              displayOrder: index,
            }),
          );
          await manager.save(options);
        }
        createdItems.push(savedItem);
      }
      return createdItems;
    });
  }

  async updateLineItem(
    auditId: string,
    itemId: string,
    dto: UpdateScopeItemDto,
  ) {
    const item = await this.scopeRepository.findOne({
      where: { id: itemId, auditId },
    });
    if (!item) throw new NotFoundException('Scope item not found');

    if (
      [LineItemStatus.SUBMITTED, LineItemStatus.EXCEPTION_APPROVED].includes(
        item.status,
      )
    ) {
      throw new UnprocessableEntityException(
        'Cannot update submitted or exception-approved item',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const { options: optionsDto, ...updateData } = dto;

      if (optionsDto !== undefined) {
        await manager.delete(AuditScopeLineItemOption, { lineItemId: itemId });
        if (optionsDto.length > 0) {
          const options = optionsDto.map((opt, index) =>
            manager.create(AuditScopeLineItemOption, {
              lineItemId: itemId,
              optionText: opt,
              displayOrder: index,
            }),
          );
          await manager.save(options);
        }
      }

      Object.assign(item, updateData);
      return await manager.save(item);
    });
  }

  async updateWeightages(
    auditId: string,
    dto: { items: { id: string; weightage: number }[] },
  ) {
    const itemIds = dto.items.map((i) => i.id);
    const existingItems = await this.scopeRepository.find({
      where: { id: In(itemIds), auditId },
    });

    if (existingItems.length !== itemIds.length) {
      throw new BadRequestException(
        'Some item IDs do not belong to this audit',
      );
    }

    const totalWeightage = dto.items.reduce((sum, i) => sum + i.weightage, 0);
    if (Math.abs(totalWeightage - 100) > 0.01) {
      throw new BadRequestException(
        `Weightages must sum to 100%. Current total: ${totalWeightage}%`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const updatedItems = [];
      for (const itemDto of dto.items) {
        await manager.update(
          AuditScopeLineItem,
          { id: itemDto.id },
          { weightage: itemDto.weightage },
        );
        updatedItems.push(
          await manager.findOne(AuditScopeLineItem, {
            where: { id: itemDto.id },
          }),
        );
      }
      return updatedItems;
    });
  }

  async distributeEqualWeightage(auditId: string) {
    const items = await this.scopeRepository.find({
      where: { auditId },
      order: { displayOrder: 'ASC' },
    });

    if (items.length === 0) return [];

    const count = items.length;
    const equalShare = Math.floor((100 / count) * 100) / 100;
    let sum = 0;

    const updatedItems = items.map((item, index) => {
      if (index === count - 1) {
        item.weightage = Math.round((100 - sum) * 100) / 100;
      } else {
        item.weightage = equalShare;
        sum += equalShare;
      }
      return item;
    });

    return await this.scopeRepository.save(updatedItems);
  }

  async removeLineItem(auditId: string, itemId: string) {
    const item = await this.scopeRepository.findOne({
      where: { id: itemId, auditId },
      relations: ['audit'],
    });
    if (!item) throw new NotFoundException('Scope item not found');

    if (
      item.audit.status !== 'draft' &&
      item.status !== LineItemStatus.NOT_STARTED
    ) {
      throw new UnprocessableEntityException(
        'Cannot delete item in an active audit unless it is not started',
      );
    }

    return await this.scopeRepository.softRemove(item);
  }

  async importFromTemplate(auditId: string, dto: ImportFromTemplateDto) {
    const templates = await this.templateRepository.find({
      where: { id: In(dto.templateIds) },
      relations: ['lineItems', 'lineItems.options'],
    });

    return await this.dataSource.transaction(async (manager) => {
      const importedItems = [];
      for (const template of templates) {
        if (!template.lineItems) continue;
        for (const tplItem of template.lineItems) {
          const newItem = manager.create(AuditScopeLineItem, {
            auditId,
            auditBusinessUnitId: dto.auditBusinessUnitId,
            name: tplItem.name,
            description: tplItem.description,
            inputMethod: tplItem.inputMethod as any,
            isOptional: tplItem.isOptional,
            displayOrder: tplItem.displayOrder,
            source: LineItemSource.TEMPLATE,
            status: LineItemStatus.NOT_STARTED,
          });

          const savedItem = await manager.save(newItem);

          if (tplItem.options && tplItem.options.length > 0) {
            const options = tplItem.options.map((opt) =>
              manager.create(AuditScopeLineItemOption, {
                lineItemId: savedItem.id,
                optionText: opt.optionText,
                displayOrder: opt.displayOrder,
              }),
            );
            await manager.save(options);
          }
          importedItems.push(savedItem);
        }
      }
      return importedItems;
    });
  }

  async extractFromDocument(
    auditId: string,
    file: Express.Multer.File,
    buId: string,
    userId: string,
  ) {
    const uploadedFile = await this.filesService.uploadFile(
      file,
      userId,
      FileEntityType.SOP_DOCUMENT,
      auditId,
    );

    const job = this.aiJobRepository.create({
      jobType: JobType.SCOPE_EXTRACTION,
      status: JobStatus.QUEUED,
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

  async importFromExcel(
    auditId: string,
    file: Express.Multer.File,
    buId: string,
  ) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet)
      throw new UnprocessableEntityException('No worksheet found in Excel');

    const rows = [];
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers.push({
        columnLetter: headerRow
          .getCell(colNumber)
          .address.replace(/[0-9]/g, ''),
        headerText: cell.text,
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: any = {};
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

  async confirmExcelImport(
    auditId: string,
    importId: string,
    dto: ConfirmExcelImportDto,
  ) {
    const session = await this.importSessionRepository.findOne({
      where: { id: importId },
    });
    if (!session) throw new NotFoundException('Import session not found');
    if (session.expiresAt && session.expiresAt < new Date())
      throw new UnprocessableEntityException('Import session expired');

    const { rows, meta } = session.data || {};
    const buId = meta?.auditBusinessUnitId;

    if (!Array.isArray(rows)) {
      throw new UnprocessableEntityException('Invalid session data');
    }

    const { columnMapping } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const createdItems = [];
      for (const row of rows) {
        const name = row[columnMapping.nameColumn];
        const description = row[columnMapping.descriptionColumn];
        if (!name) continue;

        let inputMethod = InputMethod.FREE_TEXT;
        if (columnMapping.inputMethodColumn) {
          const val = row[columnMapping.inputMethodColumn]?.toLowerCase();
          if (val?.includes('multiple') || val?.includes('choice')) {
            inputMethod = InputMethod.MULTIPLE_CHOICE;
          }
        }

        const item = manager.create(AuditScopeLineItem, {
          auditId,
          auditBusinessUnitId: buId,
          name,
          description: description || name,
          inputMethod,
          isOptional: false,
          source: LineItemSource.EXCEL_IMPORTED,
          status: LineItemStatus.NOT_STARTED,
        });
        createdItems.push(await manager.save(item));
      }
      return createdItems;
    });
  }
}
