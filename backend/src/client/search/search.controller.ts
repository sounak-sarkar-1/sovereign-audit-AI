import { Controller, UseGuards } from '@nestjs/common';
import { ClientSearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('client/search')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('client')
export class ClientSearchController {
  constructor(private readonly service: ClientSearchService) {}
  // TODO: Implement endpoints
}