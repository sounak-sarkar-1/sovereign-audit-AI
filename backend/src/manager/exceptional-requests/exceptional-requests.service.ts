import { Injectable, Logger, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest, ExceptionalActionType, ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class ManagerExceptionalRequestsService {
  private readonly logger = new Logger(ManagerExceptionalRequestsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
    @InjectRepository(ExceptionalActionRequest)
    private readonly requestRepo: Repository<ExceptionalActionRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async create(auditId: string, dto: any, manager: User) {
    const audit = await this.auditRepo.findOne({ where: { id: auditId } });
    if (!audit) throw new NotFoundException('Audit not found');

    // 1. Validate actionType vs status
    if (dto.actionType === ExceptionalActionType.DELETE) {
      if (![AuditStatus.DRAFT, AuditStatus.IN_PROGRESS].includes(audit.status)) {
        throw new UnprocessableEntityException('Deletion can only be requested for draft or in-progress audits');
      }
    } else if (dto.actionType === ExceptionalActionType.REOPEN) {
      if (audit.status !== AuditStatus.CLOSED) {
        throw new UnprocessableEntityException('Reopening can only be requested for closed audits');
      }
    }

    // 2. Check existing pending request
    const existing = await this.requestRepo.findOne({
      where: { auditId, status: ExceptionalRequestStatus.PENDING },
    });
    if (existing) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_ERROR',
        message: 'A pending exceptional action request already exists for this audit',
      });
    }

    // 3. Create request
    const request = this.requestRepo.create({
      auditId,
      actionType: dto.actionType,
      justification: dto.justification,
      status: ExceptionalRequestStatus.PENDING,
      requestedById: manager.id,
    });
    const saved = await this.requestRepo.save(request);

    // 4. Notify ALL admins in this tenant
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
    });

    for (const admin of admins) {
      await this.notificationsService.create({
        userId: admin.id,
        type: NotificationType.EXCEPTIONAL_REQUEST_RAISED,
        title: 'Exceptional Action Request',
        message: `Manager ${manager.fullName} requested ${dto.actionType} for audit ${audit.name}`,
        relatedEntityType: 'ExceptionalActionRequest',
        relatedEntityId: saved.id,
        metadata: { auditId },
      });
    }

    // 5. Log audit trail
    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.EXCEPTIONAL_REQUEST_RAISED,
      entityType: 'ExceptionalActionRequest',
      entityId: saved.id,
      metadata: { auditId, actionType: dto.actionType },
    });

    return saved;
  }
}
