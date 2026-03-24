import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminExceptionalRequestsService } from './exceptional-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ExceptionalRequestStatus } from '../../database/entities/exceptional-action-request.entity';

@Controller('admin/exceptional-requests')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminExceptionalRequestsController {
  constructor(private readonly service: AdminExceptionalRequestsService) {}

  @Get()
  async findAll(@Query('status') status?: ExceptionalRequestStatus) {
    return await this.service.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post(':id/approve')
  @UseInterceptors(FileInterceptor('evidence'))
  async approve(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('adminComment') adminComment?: string,
  ) {
    return await this.service.approve(id, req.user.id, file, adminComment);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Req() req: any,
    @Body('adminComment') adminComment: string,
  ) {
    return await this.service.reject(id, req.user.id, adminComment);
  }
}