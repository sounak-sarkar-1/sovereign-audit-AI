import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ClientInsightsService } from './insights.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('client/insights')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientInsightsController {
  constructor(private readonly service: ClientInsightsService) {}

  @Get()
  async getInsights(@Request() req: any) {
    return this.service.getGlobalInsights(req.user.id);
  }
}
