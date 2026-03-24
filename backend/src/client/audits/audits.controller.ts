import { Controller, UseGuards } from '@nestjs/common';
import { ClientAuditsService } from './audits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('client/audits')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('client')
export class ClientAuditsController {
  constructor(private readonly service: ClientAuditsService) {}
  // TODO: Implement endpoints
}