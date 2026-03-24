import { Controller, UseGuards } from '@nestjs/common';
import { AuditorScopeService } from './scope.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('auditor/scope')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('auditor')
export class AuditorScopeController {
  constructor(private readonly service: AuditorScopeService) {}
  // TODO: Implement endpoints
}