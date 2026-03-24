import { Controller, UseGuards } from '@nestjs/common';
import { AuditorExceptionsService } from './exceptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('auditor/exceptions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('auditor')
export class AuditorExceptionsController {
  constructor(private readonly service: AuditorExceptionsService) {}
  // TODO: Implement endpoints
}