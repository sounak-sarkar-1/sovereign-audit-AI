import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  AuditScopeLineItem,
  LineItemStatus,
} from '../../database/entities/audit-scope-line-item.entity';
import { LineItemResponse } from '../../database/entities/line-item-response.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import {
  UploadedFile,
  FileEntityType,
} from '../../database/entities/uploaded-file.entity';
import { LineItemComment } from '../../database/entities/line-item-comment.entity';
import { AuditorLineItemAssignment } from '../../database/entities/auditor-line-item-assignment.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
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
    @InjectRepository(AuditorAuditAssignment)
    private readonly buAssignmentRepo: Repository<AuditorAuditAssignment>,
    @InjectRepository(AuditorLineItemAssignment)
    private readonly liAssignmentRepo: Repository<AuditorLineItemAssignment>,
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

    // Get all BU assignments for this auditor in this audit
    const buAssignments = await this.buAssignmentRepo.find({
      where: { auditId, auditorId: user.id },
    });
    const assignedBUIds = new Set(
      buAssignments.map((a) => a.auditBusinessUnitId),
    );

    const results = await Promise.all(
      bus.map(async (bu) => {
        const isAssignedToBU = assignedBUIds.has(bu.id);

        let items: AuditScopeLineItem[];

        if (isAssignedToBU) {
          // Auditor is assigned to the whole BU - show all items
          items = await this.lineItemRepo.find({
            where: {
              auditId,
              auditBusinessUnitId: bu.id,
            },
            relations: ['responses', 'options'],
            order: { displayOrder: 'ASC' },
          });
        } else {
          // Auditor only sees specifically assigned items
          items = await this.lineItemRepo.find({
            where: {
              auditId,
              auditBusinessUnitId: bu.id,
              assignments: { auditorId: user.id },
            },
            relations: ['responses', 'options'],
            order: { displayOrder: 'ASC' },
          });
        }

        // Filter responses to only show this auditor's responses
        const itemsWithDrafts = items.map((item) => {
          const ownResponse = item.responses.find(
            (r) => r.auditorId === user.id,
          );
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
      }),
    );

    // Only return BUs that have at least one accessible item
    return results.filter((r) => r.items.length > 0);
  }

  async updateResponse(
    auditId: string,
    liId: string,
    user: User,
    dto: UpdateResponseDto,
  ) {
    this.logger.log(`Updating response for liId: ${liId}, isDraft: ${dto.isDraft}`);
    try {
      const lineItem = await this.lineItemRepo.findOne({
        where: { id: liId, auditId },
        relations: ['assignments'],
      });

    if (!lineItem)
      throw new NotFoundException('Line item not found in this audit');

    // Check individual assignment
    const isIndividuallyAssigned = lineItem.assignments.some(
      (a) => a.auditorId === user.id,
    );

    // Check BU-level assignment
    const isBUAssigned = await this.buAssignmentRepo.findOne({
      where: {
        auditId,
        auditBusinessUnitId: lineItem.auditBusinessUnitId,
        auditorId: user.id,
      },
    });

    if (!isIndividuallyAssigned && !isBUAssigned) {
      throw new ForbiddenException(
        'You are not assigned to this line item or its business unit',
      );
    }

    if (
      lineItem.status === LineItemStatus.SUBMITTED ||
      lineItem.status === LineItemStatus.EXCEPTION_APPROVED
    ) {
      throw new BadRequestException(
        'Line item is already submitted and locked',
      );
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
      this.logger.log(
        `Linking ${dto.evidenceFileIds.length} files to response ${response.id}`,
      );
      await this.fileRepo.update(
        {
          id: In(dto.evidenceFileIds),
          entityType: FileEntityType.LINE_ITEM_EVIDENCE,
        },
        { entityId: response.id },
      );
    }

    // Update line item status
    if (dto.isDraft) {
      lineItem.status = LineItemStatus.DRAFT_SAVED;
    } else {
      // Validate for submission
      if (
        lineItem.inputMethod === 'free_text' &&
        (!dto.responseText || dto.responseText.length < 10)
      ) {
        throw new BadRequestException(
          'Response text must be at least 10 characters',
        );
      }
      if (lineItem.inputMethod === 'multiple_choice' && !dto.selectedOptionId) {
        throw new BadRequestException('An option must be selected');
      }
      lineItem.status = LineItemStatus.SUBMITTED;
    }

      // Explicitly update status to ensure consistency
      await this.lineItemRepo.update(
        { id: liId },
        { status: lineItem.status },
      );

      return response;
    } catch (error) {
      this.logger.error(`Error in updateResponse: ${error.message}`, error.stack);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update response');
    }
  }
}
