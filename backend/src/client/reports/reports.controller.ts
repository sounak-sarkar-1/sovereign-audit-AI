import { Controller, Get, Post, Body, Param, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import { ClientReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { SubmitReportFeedbackDto } from './dto/submit-feedback.dto';

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

  @Post(':id/feedback')
  async submitFeedback(
    @Param('id') id: string,
    @Body() dto: SubmitReportFeedbackDto,
    @Request() req: any,
  ) {
    return this.service.submitFeedback(id, dto, req.user.id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const file = await this.service.download(id, req.user.id);
    const stream = fs.createReadStream(file.filePath);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
    });
    return new StreamableFile(stream);
  }
}