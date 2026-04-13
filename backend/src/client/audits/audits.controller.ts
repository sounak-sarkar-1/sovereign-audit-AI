import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ClientAuditsService } from './audits.service';
import { ManagerAuditsService } from '../../manager/audits/audits.service';
import { ManagerReportsService } from '../../manager/reports/reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditStatus } from '../../database/entities/audit.entity';
import { UserRole, User } from '../../database/entities/user.entity';

@Controller('client/audits')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientAuditsController {
  constructor(
    private readonly service: ClientAuditsService,
    private readonly managerAuditsService: ManagerAuditsService,
    private readonly managerReportsService: ManagerReportsService,
  ) {}

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

  @Get(':id/progress')
  getProgress(@Param('id') id: string, @CurrentUser() client: User) {
    return this.service.getProgress(id, client.id);
  }

  @Get(':id/compliance-comparison')
  async getComparison(@Param('id') id: string, @CurrentUser() client: User) {
    // Security check: ensure audit belongs to this client
    await this.service.findOne(id, client.id);
    return this.managerAuditsService.getComparisonData(id);
  }

  @Get(':id/reports/export-line-items')
  async exportLineItems(
    @Param('id') auditId: string,
    @CurrentUser() client: User,
    @Res() res: Response,
  ) {
    // Security check: ensure audit belongs to this client
    await this.service.findOne(auditId, client.id);
    return this.managerReportsService.exportLineItems(auditId, client, res);
  }
}
