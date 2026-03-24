import { Controller, UseGuards } from '@nestjs/common';
import { ClientInsightsService } from './insights.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('client/insights')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('client')
export class ClientInsightsController {
  constructor(private readonly service: ClientInsightsService) {}
  // TODO: Implement endpoints
}