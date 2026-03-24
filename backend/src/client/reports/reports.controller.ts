import { Controller, UseGuards } from '@nestjs/common';
import { ClientReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('client/reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('client')
export class ClientReportsController {
  constructor(private readonly service: ClientReportsService) {}
  // TODO: Implement endpoints
}