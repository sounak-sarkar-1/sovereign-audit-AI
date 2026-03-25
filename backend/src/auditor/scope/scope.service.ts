import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { LineItemResponse } from '../../database/entities/line-item-response.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import { UploadedFile, FileEntityType } from '../../database/entities/uploaded-file.entity';
import { LineItemComment } from '../../database/entities/line-item-comment.entity';
import { UpdateResponseDto } from './dto/update-response.dto';

@Injectable()
export class AuditorScopeService {
  private readonly logger = new Logger(AuditorScopeService.name);

  constructor(
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(LineItemResponse)
    private readonly responseRepo: Repository<LineItemResponse>,
    @InjectRepository(AuditBusinessUnit)
    private readonly auditBURepo: Repository<AuditBusinessUnit>,
    @InjectRepository(UploadedFile)
    private readonly fileRepo: Repository<UploadedFile>,
    @InjectRepository(LineItemComment)
    private readonly commentRepo: Repository<LineItemComment>,
  ) {}

  async getComments(liId: string) {
    return this.commentRepo.find({
      where: { lineItemId: liId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(liId: string, user: User, content: string) {
    const comment = this.commentRepo.create({
      lineItemId: liId,
      authorId: user.id,
      content,
    });
    return this.commentRepo.save(comment);
  }

  async getScope(auditId: string, user: User) {
    const bus = await this.auditBURepo.find({
      where: { auditId },
      relations: ['businessUnit'],
    });

    const results = await Promise.all(bus.map(async (bu) => {
      const items = await this.lineItemRepo.find({
        where: { 
          auditId, 
          auditBusinessUnitId: bu.id,
          assignments: { auditorId: user.id }
        },
        relations: ['responses', 'options'],
        order: { displayOrder: 'ASC' },
      });

      // Filter responses to only show this auditor's responses
      const itemsWithDrafts = items.map(item => {
        const ownResponse = item.responses.find(r => r.auditorId === user.id);
        return {
          ...item,
          ownResponse,
        };
      });

      return {
        id: bu.id,
        name: bu.businessUnit.name,
        items: itemsWithDrafts,
      };
    }));

    return results;
  }

  async updateResponse(auditId: string, liId: string, user: User, dto: UpdateResponseDto) {
    const lineItem = await this.lineItemRepo.findOne({
      where: { id: liId, auditId },
      relations: ['assignments'],
    });

    if (!lineItem) throw new NotFoundException('Line item not found in this audit');

    const isAssigned = lineItem.assignments.some(a => a.auditorId === user.id);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this line item');

    if (lineItem.status === LineItemStatus.SUBMITTED || lineItem.status === LineItemStatus.EXCEPTION_APPROVED) {
      throw new BadRequestException('Line item is already submitted and locked');
    }

    let response = await this.responseRepo.findOne({
      where: { auditScopeLineItemId: liId, auditorId: user.id },
    });

    if (!response) {
      response = this.responseRepo.create({
        auditScopeLineItemId: liId,
        auditorId: user.id,
      });
    }

    response.responseText = dto.responseText;
    response.selectedOptionId = dto.selectedOptionId;
    response.comment = dto.comment;
    response.isDraft = dto.isDraft;

    await this.responseRepo.save(response);

    // Link evidence files if provided
    if (dto.evidenceFileIds && dto.evidenceFileIds.length > 0) {
      this.logger.log(`Linking ${dto.evidenceFileIds.length} files to response ${response.id}`);
      await this.fileRepo.update(
        { id: In(dto.evidenceFileIds), entityType: FileEntityType.LINE_ITEM_EVIDENCE },
        { entityId: response.id }
      );
    }

    // Update line item status
    if (dto.isDraft) {
      lineItem.status = LineItemStatus.DRAFT_SAVED;
    } else {
      // Validate for submission
      if (lineItem.inputMethod === 'free_text' && (!dto.responseText || dto.responseText.length < 10)) {
        throw new BadRequestException('Response text must be at least 10 characters');
      }
      if (lineItem.inputMethod === 'multiple_choice' && !dto.selectedOptionId) {
        throw new BadRequestException('An option must be selected');
      }
      lineItem.status = LineItemStatus.SUBMITTED;
    }

    await this.lineItemRepo.save(lineItem);

    return response;
  }
}

