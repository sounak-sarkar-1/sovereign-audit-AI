import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExceptionRequest, ExceptionStatus } from '../../database/entities/exception-request.entity';
import { AuditScopeLineItem, LineItemStatus } from '../../database/entities/audit-scope-line-item.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
import { ApproveExceptionDto, RejectExceptionDto } from './dto/exception-action.dto';
import { User } from '../../database/entities/user.entity';
import { ExceptionComment } from '../../database/entities/exception-comment.entity';

@Injectable()
export class ManagerExceptionsService {
  private readonly logger = new Logger(ManagerExceptionsService.name);

  constructor(
    @InjectRepository(ExceptionRequest)
    private readonly exceptionRepo: Repository<ExceptionRequest>,
    @InjectRepository(AuditScopeLineItem)
    private readonly lineItemRepo: Repository<AuditScopeLineItem>,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
    private readonly dataSource: DataSource,
    @InjectRepository(ExceptionComment)
    private readonly commentRepo: Repository<ExceptionComment>,
  ) {}

  async findAll(auditId: string, status?: ExceptionStatus) {
    const query = this.exceptionRepo.createQueryBuilder('er')
      .leftJoinAndSelect('er.auditScopeLineItem', 'li')
      .leftJoinAndSelect('er.auditor', 'auditor')
      .where('li.auditId = :auditId', { auditId });

    if (status) {
      query.andWhere('er.status = :status', { status });
    }

    return query.getMany();
  }

  async findAllGlobal(status?: ExceptionStatus, manager?: User) {
    const query = this.exceptionRepo.createQueryBuilder('er')
      .leftJoinAndSelect('er.auditScopeLineItem', 'li')
      .leftJoinAndSelect('er.auditor', 'auditor');

    if (manager) {
       query.andWhere('er.managerId = :managerId', { managerId: manager.id });
    }

    if (status) {
      query.andWhere('er.status = :status', { status });
    }

    return query.getMany();
  }

  async approve(exId: string, dto: ApproveExceptionDto, manager: User) {
    const exception = await this.exceptionRepo.findOne({
      where: { id: exId },
      relations: ['auditScopeLineItem', 'auditor'],
    });

    if (!exception) {
      throw new NotFoundException('Exception request not found');
    }

    if (exception.status !== ExceptionStatus.PENDING) {
      throw new UnprocessableEntityException(`Status cannot be changed from ${exception.status}`);
    }

    await this.dataSource.transaction(async (managerEm) => {
      // 1. Update exception status
      exception.status = ExceptionStatus.APPROVED;
      exception.managerComment = dto.managerComment;
      exception.resolvedAt = new Date();
      await managerEm.save(exception);

      // 2. Update line item status
      const lineItem = exception.auditScopeLineItem;
      lineItem.status = LineItemStatus.EXCEPTION_APPROVED;
      await managerEm.save(lineItem);

      // 3. Insert notification to auditor
      await this.notificationsService.create({
        userId: exception.auditorId,
        type: NotificationType.EXCEPTION_APPROVED,
        title: 'Exception Approved',
        message: `Your exception request for line item "${lineItem.name}" has been approved.`,
        relatedEntityType: 'ExceptionRequest',
        relatedEntityId: exception.id,
        metadata: { auditId: lineItem.auditId },
      });

      // 4. Audit trail log
      await this.auditTrailService.log({
        actorId: manager.id,
        actorRole: manager.role,
        action: AuditAction.EXCEPTION_APPROVED,
        entityType: 'ExceptionRequest',
        entityId: exception.id,
        metadata: { auditId: lineItem.auditId, lineItemId: lineItem.id },
      });
    });

    return { message: 'Exception approved successfully' };
  }

  async reject(exId: string, dto: RejectExceptionDto, manager: User) {
    const exception = await this.exceptionRepo.findOne({
      where: { id: exId },
      relations: ['auditScopeLineItem', 'auditor'],
    });

    if (!exception) {
      throw new NotFoundException('Exception request not found');
    }

    if (exception.status !== ExceptionStatus.PENDING) {
      throw new UnprocessableEntityException(`Status cannot be changed from ${exception.status}`);
    }

    await this.dataSource.transaction(async (managerEm) => {
      // 1. Update exception status
      exception.status = ExceptionStatus.REJECTED;
      exception.managerComment = dto.managerComment;
      exception.resolvedAt = new Date();
      await managerEm.save(exception);

      // 2. Update line item status to returned
      const lineItem = exception.auditScopeLineItem;
      lineItem.status = LineItemStatus.RETURNED;
      await managerEm.save(lineItem);

      // 3. Insert notification to auditor
      await this.notificationsService.create({
        userId: exception.auditorId,
        type: NotificationType.EXCEPTION_REJECTED,
        title: 'Exception Rejected',
        message: `Your exception request for line item "${lineItem.name}" has been rejected. Manager comment: ${dto.managerComment}`,
        relatedEntityType: 'ExceptionRequest',
        relatedEntityId: exception.id,
        metadata: { auditId: lineItem.auditId },
      });

      // 4. Audit trail log
      await this.auditTrailService.log({
        actorId: manager.id,
        actorRole: manager.role,
        action: AuditAction.EXCEPTION_REJECTED,
        entityType: 'ExceptionRequest',
        entityId: exception.id,
        metadata: { auditId: lineItem.auditId, lineItemId: lineItem.id },
      });
    });

    return { message: 'Exception rejected successfully' };
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
