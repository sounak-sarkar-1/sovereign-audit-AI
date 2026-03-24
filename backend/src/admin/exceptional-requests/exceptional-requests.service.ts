import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExceptionalActionRequest, ExceptionalRequestStatus, ExceptionalActionType } from '../../database/entities/exceptional-action-request.entity';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { FilesService } from '../../shared/files/files.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FileEntityType } from '../../database/entities/uploaded-file.entity';
import { NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class AdminExceptionalRequestsService {
  private readonly logger = new Logger(AdminExceptionalRequestsService.name);

  constructor(
    @InjectRepository(ExceptionalActionRequest)
    private readonly requestRepository: Repository<ExceptionalActionRequest>,
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    @InjectRepository(AuditTrailLog)
    private readonly auditTrailRepository: Repository<AuditTrailLog>,
    private readonly filesService: FilesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(status?: ExceptionalRequestStatus): Promise<ExceptionalActionRequest[]> {
    const where = status ? { status } : {};
    return await this.requestRepository.find({
      where,
      relations: ['audit', 'requester', 'audit.client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ExceptionalActionRequest> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['audit', 'requester', 'audit.client'],
    });

    if (!request) {
      throw new NotFoundException(`Exceptional request with ID ${id} not found`);
    }

    return request;
  }

  async approve(
    id: string,
    adminId: string,
    file: Express.Multer.File,
    adminComment?: string,
  ): Promise<ExceptionalActionRequest> {
    const request = await this.findOne(id);

    if (request.status !== ExceptionalRequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    // Upload evidence file
    const uploadedFile = await this.filesService.uploadFile(
      file,
      adminId,
      FileEntityType.EXCEPTIONAL_ACTION_EVIDENCE,
      request.id,
    );

    // Update request status
    request.status = ExceptionalRequestStatus.APPROVED;
    request.resolvedAt = new Date();
    request.resolvedById = adminId;
    request.adminComment = adminComment;
    request.evidenceFileId = uploadedFile.id;

    await this.requestRepository.save(request);

    // Perform the action on the audit
    const audit = await this.auditRepository.findOne({ where: { id: request.auditId } });
    if (!audit) {
        throw new NotFoundException(`Audit ${request.auditId} not found`);
    }

    if (request.actionType === ExceptionalActionType.DELETE) {
      audit.deletedAt = new Date();
      // Also update status if needed, but soft-delete usually relies on deletedAt
      await this.auditRepository.save(audit);
      
      await this.auditTrailRepository.save(this.auditTrailRepository.create({
        actorUserId: adminId,
        actorRole: 'admin',
        actionType: 'AUDIT_DELETED',
        entityType: 'audit',
        entityId: audit.id,
        payload: { requestId: request.id },
      }));
    } else if (request.actionType === ExceptionalActionType.REOPEN) {
      audit.status = AuditStatus.REOPENED;
      audit.deletedAt = null;
      await this.auditRepository.save(audit);

      await this.auditTrailRepository.save(this.auditTrailRepository.create({
        actorUserId: adminId,
        actorRole: 'admin',
        actionType: 'AUDIT_REOPENED',
        entityType: 'audit',
        entityId: audit.id,
        payload: { requestId: request.id },
      }));
    }

    // Notify manager
    await this.notificationsService.create({
      userId: request.requestedById,
      type: NotificationType.EXCEPTIONAL_REQUEST_RESOLVED,
      title: `Exceptional Request Approved`,
      message: `Your request to ${request.actionType} audit "${audit.name}" has been approved by the admin.`,
      relatedEntityType: 'exceptional_action_request',
      relatedEntityId: request.id,
      metadata: { auditId: request.auditId },
    });

    return request;
  }

  async reject(
    id: string,
    adminId: string,
    adminComment: string,
  ): Promise<ExceptionalActionRequest> {
    const request = await this.findOne(id);

    if (request.status !== ExceptionalRequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    request.status = ExceptionalRequestStatus.REJECTED;
    request.resolvedAt = new Date();
    request.resolvedById = adminId;
    request.adminComment = adminComment;

    await this.requestRepository.save(request);

    // Notify manager
    await this.notificationsService.create({
      userId: request.requestedById,
      type: NotificationType.EXCEPTIONAL_REQUEST_RESOLVED,
      title: `Exceptional Request Rejected`,
      message: `Your request to ${request.actionType} audit has been rejected. Comment: ${adminComment}`,
      relatedEntityType: 'exceptional_action_request',
      relatedEntityId: request.id,
      metadata: { auditId: request.auditId },
    });

    return request;
  }
}
