import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { AuditTemplateLineItem } from '../../database/entities/audit-template-line-item.entity';
import { AuditTemplateOption } from '../../database/entities/audit-template-option.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(AuditTemplate)
    private templateRepo: Repository<AuditTemplate>,
    private dataSource: DataSource,
    private auditTrailService: AuditTrailService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
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

  async findOne(id: string) {
    const template = await this.templateRepo.findOne({
      where: { id, deletedAt: IsNull() },
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
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async create(createDto: CreateTemplateDto, userId: string) {
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
          const lineItem = queryRunner.manager.create(AuditTemplateLineItem, {
            templateId: savedTemplate.id,
            name: itemDto.name,
            description: itemDto.description,
            inputMethod: itemDto.inputMethod,
            isOptional: itemDto.isOptional || false,
            displayOrder: itemDto.displayOrder || 0,
          });

          const savedLineItem = await queryRunner.manager.save(lineItem);

          if (itemDto.options && itemDto.options.length > 0) {
            const options = itemDto.options.map((optDto) =>
              queryRunner.manager.create(AuditTemplateOption, {
                lineItemId: savedLineItem.id,
                optionText: optDto.optionText,
                displayOrder: optDto.displayOrder || 0,
              }),
            );
            await queryRunner.manager.save(options);
          }
        }
      }

      await queryRunner.commitTransaction();

      await this.auditTrailService.log({
        actorId: userId,
        action: AuditAction.TEMPLATE_CREATED,
        entityType: 'AuditTemplate',
        entityId: savedTemplate.id,
        metadata: { name: savedTemplate.name },
      });

      return this.findOne(savedTemplate.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create audit template');
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateDto: UpdateTemplateDto, userId: string) {
    const template = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update template meta
      if (updateDto.name) template.name = updateDto.name;
      if (updateDto.description !== undefined) template.description = updateDto.description;
      await queryRunner.manager.save(template);

      if (updateDto.lineItems) {
        // Full replacement strategy: Soft-delete old ones, insert new ones
        await queryRunner.manager.update(
          AuditTemplateLineItem,
          { templateId: id, deletedAt: IsNull() },
          { deletedAt: new Date() },
        );

        for (const itemDto of updateDto.lineItems) {
          const lineItem = queryRunner.manager.create(AuditTemplateLineItem, {
            templateId: id,
            name: itemDto.name,
            description: itemDto.description,
            inputMethod: itemDto.inputMethod,
            isOptional: itemDto.isOptional || false,
            displayOrder: itemDto.displayOrder || 0,
          });

          const savedLineItem = await queryRunner.manager.save(lineItem);

          if (itemDto.options && itemDto.options.length > 0) {
            const options = itemDto.options.map((optDto) =>
              queryRunner.manager.create(AuditTemplateOption, {
                lineItemId: savedLineItem.id,
                optionText: optDto.optionText,
                displayOrder: optDto.displayOrder || 0,
              }),
            );
            await queryRunner.manager.save(options);
          }
        }
      }

      await queryRunner.commitTransaction();

      await this.auditTrailService.log({
        actorId: userId,
        action: AuditAction.TEMPLATE_UPDATED,
        entityType: 'AuditTemplate',
        entityId: id,
        metadata: updateDto,
      });

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update audit template');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string) {
    const template = await this.findOne(id);

    // TODO: Implement check for active audits using items from this template.
    // Since there's no direct foreign key in audit_scope_line_items,
    // we would ideally need a source_template_id there.
    // For now, returning warningCount: 0.
    const warningCount = 0;

    template.deletedAt = new Date();
    await this.templateRepo.save(template);

    // Soft-delete line items too
    await this.dataSource.createQueryBuilder()
      .update(AuditTemplateLineItem)
      .set({ deletedAt: new Date() })
      .where('template_id = :id AND deleted_at IS NULL', { id })
      .execute();

    await this.auditTrailService.log({
      actorId: userId,
      action: AuditAction.TEMPLATE_DELETED,
      entityType: 'AuditTemplate',
      entityId: id,
      metadata: { name: template.name },
    });

    return {
      message: 'Template deleted successfully',
      warningCount,
    };
  }
}