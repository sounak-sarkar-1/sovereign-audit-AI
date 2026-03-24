import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ClarificationResponse } from '../../database/entities/clarification-response.entity';
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
    private readonly notificationsService: NotificationsService,
  ) {}

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
