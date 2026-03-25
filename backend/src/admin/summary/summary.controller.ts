import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminSummaryService } from './summary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/summary')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminSummaryController {
  constructor(private readonly service: AdminSummaryService) {}

  @Get()
  getSummary() {
    return this.service.getDashboardSummary();
  }
}
