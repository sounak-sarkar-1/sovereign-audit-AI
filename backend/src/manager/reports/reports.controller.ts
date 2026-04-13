import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ManagerReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Response } from 'express';

@Controller('manager/audits/:id/reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerReportsController {
  constructor(private readonly service: ManagerReportsService) {}

  @Post('generate')
  generate(@Param('id') auditId: string, @CurrentUser() manager: User) {
    return this.service.generate(auditId, manager);
  }

  @Get()
  findAll(@Param('id') auditId: string) {
    return this.service.findAll(auditId);
  }

  @Post(':rId/send')
  sendToClient(
    @Param('id') auditId: string,
    @Param('rId') reportId: string,
    @CurrentUser() manager: User,
  ) {
    return this.service.sendToClient(auditId, reportId, manager);
  }

  @Post(':rId/finalize')
  finalize(
    @Param('id') auditId: string,
    @Param('rId') reportId: string,
    @CurrentUser() manager: User,
  ) {
    return this.service.finalize(auditId, reportId, manager);
  }

  @Get(':rId/download')
  async download(
    @Param('id') auditId: string,
    @Param('rId') reportId: string,
    @Res() res: Response,
  ) {
    return this.service.download(auditId, reportId, res);
  }

  @Post(':rId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') auditId: string,
    @Param('rId') reportId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() manager: User,
  ) {
    return this.service.uploadVersion(auditId, reportId, file, manager);
  }
}
