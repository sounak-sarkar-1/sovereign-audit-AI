import { Controller, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('shared/files')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin', 'manager', 'auditor', 'client')
export class FilesController {
  constructor(private readonly service: FilesService) {}
  // TODO: Implement endpoints
}