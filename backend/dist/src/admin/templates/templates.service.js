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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_template_entity_1 = require("../../database/entities/audit-template.entity");
const audit_template_line_item_entity_1 = require("../../database/entities/audit-template-line-item.entity");
const audit_template_option_entity_1 = require("../../database/entities/audit-template-option.entity");
const audit_trail_service_1 = require("../../shared/audit-trail/audit-trail.service");
let TemplatesService = class TemplatesService {
    constructor(templateRepo, dataSource, auditTrailService) {
        this.templateRepo = templateRepo;
        this.dataSource = dataSource;
        this.auditTrailService = auditTrailService;
    }
    async findAll(page = 1, limit = 10, search) {
        const query = this.templateRepo.createQueryBuilder('template')
            .where('template.deleted_at IS NULL');
        if (search) {
            query.andWhere('template.name ILIKE :search', { search: `%${search}%` });
        }
        const [items, total] = await query
            .orderBy('template.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const template = await this.templateRepo.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['lineItems', 'lineItems.options'],
            order: {
                lineItems: {
                    displayOrder: 'ASC',
                    options: {
                        displayOrder: 'ASC',
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }
    async create(createDto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const template = this.templateRepo.create({
                name: createDto.name,
                description: createDto.description,
                createdById: userId,
            });
            const savedTemplate = await queryRunner.manager.save(template);
            if (createDto.lineItems && createDto.lineItems.length > 0) {
                for (const itemDto of createDto.lineItems) {
                    const lineItem = queryRunner.manager.create(audit_template_line_item_entity_1.AuditTemplateLineItem, {
                        templateId: savedTemplate.id,
                        name: itemDto.name,
                        description: itemDto.description,
                        inputMethod: itemDto.inputMethod,
                        isOptional: itemDto.isOptional || false,
                        displayOrder: itemDto.displayOrder || 0,
                    });
                    const savedLineItem = await queryRunner.manager.save(lineItem);
                    if (itemDto.options && itemDto.options.length > 0) {
                        const options = itemDto.options.map((optDto) => queryRunner.manager.create(audit_template_option_entity_1.AuditTemplateOption, {
                            lineItemId: savedLineItem.id,
                            optionText: optDto.optionText,
                            displayOrder: optDto.displayOrder || 0,
                        }));
                        await queryRunner.manager.save(options);
                    }
                }
            }
            await queryRunner.commitTransaction();
            await this.auditTrailService.log({
                actorId: userId,
                action: audit_trail_service_1.AuditAction.TEMPLATE_CREATED,
                entityType: 'AuditTemplate',
                entityId: savedTemplate.id,
                metadata: { name: savedTemplate.name },
            });
            return this.findOne(savedTemplate.id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('Failed to create audit template');
        }
        finally {
            await queryRunner.release();
        }
    }
    async update(id, updateDto, userId) {
        const template = await this.findOne(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (updateDto.name)
                template.name = updateDto.name;
            if (updateDto.description !== undefined)
                template.description = updateDto.description;
            await queryRunner.manager.save(template);
            if (updateDto.lineItems) {
                await queryRunner.manager.update(audit_template_line_item_entity_1.AuditTemplateLineItem, { templateId: id, deletedAt: (0, typeorm_2.IsNull)() }, { deletedAt: new Date() });
                for (const itemDto of updateDto.lineItems) {
                    const lineItem = queryRunner.manager.create(audit_template_line_item_entity_1.AuditTemplateLineItem, {
                        templateId: id,
                        name: itemDto.name,
                        description: itemDto.description,
                        inputMethod: itemDto.inputMethod,
                        isOptional: itemDto.isOptional || false,
                        displayOrder: itemDto.displayOrder || 0,
                    });
                    const savedLineItem = await queryRunner.manager.save(lineItem);
                    if (itemDto.options && itemDto.options.length > 0) {
                        const options = itemDto.options.map((optDto) => queryRunner.manager.create(audit_template_option_entity_1.AuditTemplateOption, {
                            lineItemId: savedLineItem.id,
                            optionText: optDto.optionText,
                            displayOrder: optDto.displayOrder || 0,
                        }));
                        await queryRunner.manager.save(options);
                    }
                }
            }
            await queryRunner.commitTransaction();
            await this.auditTrailService.log({
                actorId: userId,
                action: audit_trail_service_1.AuditAction.TEMPLATE_UPDATED,
                entityType: 'AuditTemplate',
                entityId: id,
                metadata: updateDto,
            });
            return this.findOne(id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('Failed to update audit template');
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id, userId) {
        const template = await this.findOne(id);
        const warningCount = 0;
        template.deletedAt = new Date();
        await this.templateRepo.save(template);
        await this.dataSource.createQueryBuilder()
            .update(audit_template_line_item_entity_1.AuditTemplateLineItem)
            .set({ deletedAt: new Date() })
            .where('template_id = :id AND deleted_at IS NULL', { id })
            .execute();
        await this.auditTrailService.log({
            actorId: userId,
            action: audit_trail_service_1.AuditAction.TEMPLATE_DELETED,
            entityType: 'AuditTemplate',
            entityId: id,
            metadata: { name: template.name },
        });
        return {
            message: 'Template deleted successfully',
            warningCount,
        };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_template_entity_1.AuditTemplate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        audit_trail_service_1.AuditTrailService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map