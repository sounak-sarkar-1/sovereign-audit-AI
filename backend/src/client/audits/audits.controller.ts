import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ClientAuditsService } from './audits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditStatus } from '../../database/entities/audit.entity';
import { UserRole } from '../../database/entities/user.entity';

@Controller('client/audits')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientAuditsController {
  constructor(private readonly service: ClientAuditsService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: AuditStatus,
  ) {
    return this.service.findAll(req.user.id, page, limit, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.id);
  }
}