import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AiJobsService } from './ai-jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ai-jobs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin', 'manager', 'auditor', 'client')
export class AiJobsController {
  constructor(private readonly service: AiJobsService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
