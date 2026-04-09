import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuditTrailService, AuditAction } from '../../shared/audit-trail/audit-trail.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminAuditTrailController {
  constructor(private readonly service: AuditTrailService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
    @Query('actorId') actorId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll({ page, limit, action, entityType, actorId, search, startDate, endDate });
  }

  @Get('export')
  async export(
    @Res() res: Response,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { data: logs } = await this.service.findAll({ startDate, endDate, limit: 10000 });

    if (format === 'csv') {
      const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Entity ID', 'IP'];
      const rows = logs.map(l => [
        l.createdAt, l.actorUserId, l.actorRole, l.actionType,
        l.entityType, l.entityId, l.ipAddress || ''
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.csv"`);
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.json"`);
    return res.json(logs);
  }
}
