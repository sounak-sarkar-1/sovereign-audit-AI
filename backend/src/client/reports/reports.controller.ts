import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ClientReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../../database/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('client/reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientReportsController {
  constructor(private readonly service: ClientReportsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findOne(id, req.user.id);
  }

  @Post(':reportId/feedback')
  async submitFeedback(
    @Param('reportId') reportId: string,
    @Body('feedback') feedback: any[],
    @CurrentUser() client: User,
  ) {
    return this.service.submitFeedback(reportId, feedback, client.id);
  }

  @Get(':reportId/download')
  async download(
    @Param('reportId') reportId: string,
    @CurrentUser() client: User,
    @Res() res: Response,
  ) {
    return this.service.download(reportId, client.id, res);
  }
}
