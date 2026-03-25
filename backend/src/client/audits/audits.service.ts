import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditStatus } from '../../database/entities/audit.entity';

@Injectable()
export class ClientAuditsService {
  private readonly logger = new Logger(ClientAuditsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async findAll(clientId: string, page: number = 1, limit: number = 10, status?: AuditStatus) {
    const query = this.auditRepo.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.manager', 'manager')
      .where('audit.clientId = :clientId', { clientId })
      .andWhere('audit.status != :status', { status: AuditStatus.DRAFT }); // Clients don't see drafts

    if (status) {
      query.andWhere('audit.status = :status', { status });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('audit.createdAt', 'DESC')
      .getManyAndCount();

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

  async findOne(id: string, clientId: string) {
    const audit = await this.auditRepo.findOne({
      where: { id, clientId },
      relations: ['manager'],
    });

    if (!audit || audit.status === AuditStatus.DRAFT) {
      throw new NotFoundException('Audit not found');
    }

    return { data: audit };
  }
}
