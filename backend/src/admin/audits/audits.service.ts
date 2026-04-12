import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from '../../database/entities/audit.entity';
import { AuditFilterDto } from './dto/audit-filter.dto';

@Injectable()
export class AdminAuditsService {
  private readonly logger = new Logger(AdminAuditsService.name);

  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  async findAll(filters: AuditFilterDto): Promise<Audit[]> {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.client', 'client')
      .leftJoinAndSelect('audit.manager', 'manager')
      .withDeleted(); // Include soft-deleted audits

    if (filters.search) {
      query.andWhere('audit.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.status) {
      query.andWhere('audit.status = :status', { status: filters.status });
    }

    if (filters.clientId) {
      query.andWhere('audit.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    if (filters.managerId) {
      query.andWhere('audit.managerId = :managerId', {
        managerId: filters.managerId,
      });
    }

    if (filters.startDate) {
      query.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    query.orderBy(`audit.${sortBy}`, sortOrder);

    return await query.getMany();
  }

  async exportCsv(filters: AuditFilterDto): Promise<string> {
    const audits = await this.findAll(filters);

    const headers = [
      'Audit ID',
      'Name',
      'Client',
      'Manager',
      'Status',
      'Start Date',
      'Expected Completion',
      'Created At',
      'Deleted At',
    ];

    const rows = audits.map((audit) => [
      audit.id,
      audit.name,
      audit.client?.fullName || 'N/A',
      audit.manager?.fullName || 'N/A',
      audit.status,
      audit.startDate ? new Date(audit.startDate).toISOString() : 'N/A',
      audit.expectedCompletionDate
        ? new Date(audit.expectedCompletionDate).toISOString()
        : 'N/A',
      new Date(audit.createdAt).toISOString(),
      audit.deletedAt ? new Date(audit.deletedAt).toISOString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }
}
