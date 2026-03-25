import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  ) {
    return this.service.findAll({ page, limit, action, entityType, actorId, search });
  }
}
