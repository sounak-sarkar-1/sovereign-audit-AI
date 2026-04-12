import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AdminAuditsService } from './audits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditFilterDto } from './dto/audit-filter.dto';

@Controller('admin/audits')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminAuditsController {
  constructor(private readonly service: AdminAuditsService) {}

  @Get()
  async findAll(@Query() filters: AuditFilterDto) {
    return await this.service.findAll(filters);
  }

  @Get('export')
  async exportCsv(@Query() filters: AuditFilterDto, @Res() res: Response) {
    const csvContent = await this.service.exportCsv(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=audits-export.csv',
    );
    res.status(200).send(csvContent);
  }
}
