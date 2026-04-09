import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  AUDIT_CREATED = 'AUDIT_CREATED',
  AUDIT_UPDATED = 'AUDIT_UPDATED',
  AUDIT_STARTED = 'AUDIT_STARTED',
  SCOPE_DEFINED = 'SCOPE_DEFINED',
  AUDITOR_ASSIGNED = 'AUDITOR_ASSIGNED',
  RESPONSE_SUBMITTED = 'RESPONSE_SUBMITTED',
  EXCEPTION_RAISED = 'EXCEPTION_RAISED',
  EXCEPTION_APPROVED = 'EXCEPTION_APPROVED',
  EXCEPTION_REJECTED = 'EXCEPTION_REJECTED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_SENT_TO_CLIENT = 'REPORT_SENT_TO_CLIENT',
  CLIENT_FEEDBACK_SUBMITTED = 'CLIENT_FEEDBACK_SUBMITTED',
  AUDIT_CLOSED = 'AUDIT_CLOSED',
  AUDIT_DELETED = 'AUDIT_DELETED',
  AUDIT_REOPENED = 'AUDIT_REOPENED',
  AUDIT_ARCHIVED = 'AUDIT_ARCHIVED',
  EXCEPTIONAL_REQUEST_RAISED = 'EXCEPTIONAL_REQUEST_RAISED',
  EXCEPTIONAL_REQUEST_APPROVED = 'EXCEPTIONAL_REQUEST_APPROVED',
  EXCEPTIONAL_REQUEST_REJECTED = 'EXCEPTIONAL_REQUEST_REJECTED',
  MAPPING_CREATED = 'MAPPING_CREATED',
  MAPPING_DELETED = 'MAPPING_DELETED',
  TEMPLATE_CREATED = 'TEMPLATE_CREATED',
  TEMPLATE_UPDATED = 'TEMPLATE_UPDATED',
  TEMPLATE_DELETED = 'TEMPLATE_DELETED',
  CLARIFICATION_CLOSED = 'CLARIFICATION_CLOSED',
  CLARIFICATION_RESPONDED = 'CLARIFICATION_RESPONDED',
}

interface LogEntry {
  actorId?: string;
  actorRole?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  constructor(
    @InjectRepository(AuditTrailLog)
    private readonly repository: Repository<AuditTrailLog>,
  ) {}

  async log(entry: LogEntry): Promise<void> {
    try {
      const logRecord = this.repository.create({
        actorUserId: entry.actorId,
        actorRole: entry.actorRole,
        actionType: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        payload: entry.metadata,
        ipAddress: entry.ipAddress,
      });

      await this.repository.insert(logRecord);
    } catch (error) {
      this.logger.error(`Failed to create audit trail log: ${error.message}`, error.stack);
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    entityType?: string;
    actorId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: AuditTrailLog[]; meta: any }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('log')
      .leftJoinAndSelect('log.actorUser', 'actor')
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (query.action) {
      qb.andWhere('log.actionType = :action', { action: query.action });
    }

    if (query.entityType) {
      qb.andWhere('log.entityType = :entityType', { entityType: query.entityType });
    }

    if (query.actorId) {
      qb.andWhere('log.actorUserId = :actorId', { actorId: query.actorId });
    }

    if (query.search) {
      qb.andWhere('(log.entityId ILIKE :search OR CAST(log.payload AS TEXT) ILIKE :search)', { 
        search: `%${query.search}%` 
      });
    }

    if (query.startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: query.endDate });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findForAudit(auditId: string): Promise<AuditTrailLog[]> {
    return this.repository.createQueryBuilder('log')
      .leftJoinAndSelect('log.actorUser', 'actor')
      .where('log.entityId = :auditId', { auditId })
      .orWhere("log.payload->>'auditId' = :auditId", { auditId })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }
}
