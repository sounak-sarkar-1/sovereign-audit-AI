import { Injectable, Logger, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';
import { User } from '../../database/entities/user.entity';
import { UploadedFile, FileEntityType } from '../../database/entities/uploaded-file.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';
import { CreateExceptionDto } from './dto/create-exception.dto';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
import { NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class AuditorExceptionsService {
  private readonly logger = new Logger(AuditorExceptionsService.name);

  constructor(
    @InjectRepository(ExceptionRequest)
    private readonly exceptionRepo: Repository<ExceptionRequest>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(UploadedFile)
    private readonly fileRepo: Repository<UploadedFile>,
    @InjectRepository(AuditBusinessUnit)
    private readonly auditBURepo: Repository<AuditBusinessUnit>,
    @InjectRepository(ExceptionComment)
    private readonly commentRepo: Repository<ExceptionComment>,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async findByAudit(auditId: string, user: User) {
    return this.exceptionRepo.find({
      where: { auditScopeLineItem: { auditId }, auditorId: user.id },
      relations: ['auditScopeLineItem'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllGlobal(user: User) {
    return this.exceptionRepo.find({
      where: { auditorId: user.id },
      relations: ['auditScopeLineItem', 'manager'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(auditId: string, user: User, dto: CreateExceptionDto) {
    const audit = await this.auditRepo.findOne({
      where: { id: auditId },
    });
    if (!audit) throw new NotFoundException('Audit not found');

    const lineItem = await this.lineItemRepo.findOne({
      where: { id: dto.lineItemId, auditId },
    });
    if (!lineItem) throw new NotFoundException('Line item not found in this audit');

    if (lineItem.status === LineItemStatus.SUBMITTED || lineItem.status === LineItemStatus.EXCEPTION_APPROVED) {
      throw new UnprocessableEntityException('Line item is already submitted or approved');
    }

    const existingRequest = await this.exceptionRepo.findOne({
      where: { auditScopeLineItemId: dto.lineItemId, status: In(['pending']) },
    });
    if (existingRequest) {
      throw new UnprocessableEntityException('A pending exception request already exists for this line item');
    }

    const exception = this.exceptionRepo.create({
      auditScopeLineItemId: dto.lineItemId,
      auditorId: user.id,
      managerId: audit.managerId,
      justification: dto.justification,
    });

    await this.exceptionRepo.save(exception);

    // Link evidence files if provided
    if (dto.evidenceFileIds && dto.evidenceFileIds.length > 0) {
      this.logger.log(`Linking ${dto.evidenceFileIds.length} files to exception ${exception.id}`);
      await this.fileRepo.update(
        { id: In(dto.evidenceFileIds), entityType: FileEntityType.EXCEPTION_EVIDENCE },
        { entityId: exception.id }
      );
    }

    // Update line item status
    lineItem.status = LineItemStatus.EXCEPTION_PENDING;
    await this.lineItemRepo.save(lineItem);

    // Notify manager
    await this.notificationsService.create({
      userId: audit.managerId,
      type: NotificationType.EXCEPTION_RAISED,
      title: 'Exception Requested',
      message: `Auditor ${user.fullName} requested an exception for line item: ${lineItem.name}`,
      relatedEntityType: 'exception_request',
      relatedEntityId: exception.id,
      metadata: { auditId },
    });

    // Audit trail
    await this.auditTrailService.log({
      actorId: user.id,
      actorRole: user.role,
      action: AuditAction.EXCEPTION_RAISED,
      entityType: 'exception_request',
      entityId: exception.id,
      metadata: { auditId, lineItemId: dto.lineItemId },
    });

    return exception;
  }

  async getComments(exceptionId: string) {
    return this.commentRepo.find({
      where: { exceptionRequestId: exceptionId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(exceptionId: string, user: User, content: string) {
    const comment = this.commentRepo.create({
      exceptionRequestId: exceptionId,
      authorId: user.id,
      content,
    });
    return this.commentRepo.save(comment);
  }
}

