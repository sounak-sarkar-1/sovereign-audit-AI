import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HeatmapService } from './heatmap.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('manager/auditors')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerAuditorsController {
  constructor(private readonly heatmapService: HeatmapService) {}

  @Get('heatmap')
  async getHeatmap(
    @CurrentUser('id') managerId: string,
    @Query('auditId') auditId?: string,
  ) {
    return this.heatmapService.getHeatmap(managerId, auditId);
  }
}
