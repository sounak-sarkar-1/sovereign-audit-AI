import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClarificationRequest, ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { CreateClarificationDto } from './dto/create-clarification.dto';
import { User } from '../../database/entities/user.entity';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';

@Injectable()
export class ManagerClarificationsService {
  private readonly logger = new Logger(ManagerClarificationsService.name);

  constructor(
    @InjectRepository(ClarificationRequest)
    private readonly clarificationRepo: Repository<ClarificationRequest>,
    @InjectRepository(ExceptionRequest)
    private readonly exceptionRepo: Repository<ExceptionRequest>,
    private readonly notificationsService: NotificationsService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  async findAll(status?: ClarificationStatus, manager?: User) {
    const query = this.clarificationRepo.createQueryBuilder('cr')
      .leftJoinAndSelect('cr.audit', 'audit')
      .leftJoinAndSelect('cr.client', 'client')
      .leftJoinAndSelect('cr.responses', 'responses')
      .orderBy('cr.createdAt', 'DESC');

    if (manager) {
      query.andWhere('cr.managerId = :managerId', { managerId: manager.id });
    }

    if (status) {
      query.andWhere('cr.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const clarification = await this.clarificationRepo.findOne({
      where: { id },
      relations: ['audit', 'client', 'responses', 'responses.user', 'relatedException'],
      order: { responses: { createdAt: 'ASC' } },
    });

    if (!clarification) {
      throw new NotFoundException('Clarification thread not found');
    }

    return clarification;
  }

  async close(id: string, manager: User) {
    const clarification = await this.clarificationRepo.findOne({ where: { id } });
    if (!clarification) {
      throw new NotFoundException('Clarification thread not found');
    }

    clarification.status = ClarificationStatus.CLOSED;
    await this.clarificationRepo.save(clarification);

    await this.auditTrailService.log({
      actorId: manager.id,
      actorRole: manager.role,
      action: AuditAction.CLARIFICATION_CLOSED,
      entityType: 'ClarificationRequest',
      entityId: clarification.id,
      metadata: { auditId: clarification.auditId },
    });

    return { message: 'Clarification thread closed' };
  }

  async create(dto: CreateClarificationDto, manager: User) {
    if (dto.relatedExceptionId) {
      const exception = await this.exceptionRepo.findOne({ where: { id: dto.relatedExceptionId } });
      if (!exception) {
        throw new BadRequestException('Related exception not found');
      }
    }

    const clarification = this.clarificationRepo.create({
      auditId: dto.auditId,
      managerId: manager.id,
      clientId: dto.clientId,
      message: dto.message,
      relatedExceptionId: dto.relatedExceptionId,
      status: ClarificationStatus.PENDING,
    });

    const saved = await this.clarificationRepo.save(clarification);

    // 2. Insert notification to client
    await this.notificationsService.create({
      userId: dto.clientId,
      type: NotificationType.CLARIFICATION_REQUEST,
      title: 'Clarification Requested',
      message: `A manager has requested clarification for an audit item. Message: ${dto.message}`,
      relatedEntityType: 'ClarificationRequest',
      relatedEntityId: saved.id,
      metadata: { auditId: dto.auditId },
    });

    return saved;
  }
}
