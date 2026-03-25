import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  async respond(id: string, dto: RespondToClarificationDto, user: User) {
    const clarification = await this.clarificationRepo.findOne({ where: { id } });
    if (!clarification) {
      throw new NotFoundException('Clarification thread not found');
    }

    const response = this.responseRepo.create({
      clarificationRequestId: id,
      respondedBy: user.id,
      message: dto.message,
    });
    await this.responseRepo.save(response);

    // Link attachments if provided
    if (dto.attachmentFileIds && dto.attachmentFileIds.length > 0) {
      this.logger.log(`Linking ${dto.attachmentFileIds.length} files to clarification response ${response.id}`);
      await this.fileRepo.update(
        { id: In(dto.attachmentFileIds), entityType: FileEntityType.CLARIFICATION_ATTACHMENT },
        { entityId: response.id }
      );
    }

    clarification.status = ClarificationStatus.RESPONDED;
    await this.clarificationRepo.save(clarification);

    // Notify manager
    await this.notificationsService.create({
      userId: clarification.managerId,
      type: NotificationType.CLARIFICATION_RESPONDED,
      title: 'Clarification Responded',
      message: `Client ${user.fullName} has responded to your clarification request.`,
      relatedEntityType: 'ClarificationRequest',
      relatedEntityId: clarification.id,
      metadata: { auditId: clarification.auditId },
    });

    return response;
  }
}
