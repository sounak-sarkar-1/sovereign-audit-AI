import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
import { UploadedFile, FileEntityType } from '../../database/entities/uploaded-file.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ClientClarificationsService {
  private readonly logger = new Logger(ClientClarificationsService.name);

  constructor(
    @InjectRepository(ClarificationRequest)
    private readonly clarificationRepo: Repository<ClarificationRequest>,
    @InjectRepository(ClarificationResponse)
    private readonly responseRepo: Repository<ClarificationResponse>,
    @InjectRepository(UploadedFile)
    private readonly fileRepo: Repository<UploadedFile>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(clientId: string, status?: ClarificationStatus) {
    const query = this.clarificationRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.audit', 'audit')
      .leftJoinAndSelect('c.manager', 'manager')
      .where('c.clientId = :clientId', { clientId });

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    return query.orderBy('c.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, clientId: string) {
    const thread = await this.clarificationRepo.findOne({
      where: { id, clientId },
      relations: ['audit', 'manager', 'responses', 'responses.responder'],
    });

    if (!thread) {
      throw new NotFoundException('Clarification thread not found');
    }

    return thread;
  }

  async respond(id: string, clientId: string, message: string, attachmentFileIds?: string[]) {
    const thread = await this.clarificationRepo.findOne({
      where: { id, clientId },
      relations: ['audit'],
    });
    if (!thread) {
      throw new NotFoundException('Clarification thread not found');
    }
    if (thread.status === ClarificationStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed thread');
    }

    // Save response
    const response = this.responseRepo.create({
      clarificationRequestId: id,
      respondedBy: clientId,
      message,
    });
    await this.responseRepo.save(response);

    // Link file attachments if any
    if (attachmentFileIds?.length) {
      await this.fileRepo.update(
        { id: In(attachmentFileIds) },
        { entityId: response.id }
      );
    }

    // Update thread status
    thread.status = ClarificationStatus.PENDING; // Back to pending = manager's turn
    await this.clarificationRepo.save(thread);

    // Notify manager
    await this.notificationsService.create({
      userId: thread.managerId,
      type: NotificationType.CLARIFICATION_REQUEST,
      title: 'Client replied to a clarification',
      message: `Client has responded to your clarification on audit "${thread.audit?.name}"`,
      relatedEntityType: 'ClarificationRequest',
      relatedEntityId: id,
      metadata: { auditId: thread.auditId },
    });

    return response;
  }
}
