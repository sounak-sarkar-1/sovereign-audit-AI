import { Controller, Get, Post, Delete, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminMappingsService } from './mappings.service';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/mappings')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminMappingsController {
  constructor(private readonly service: AdminMappingsService) {}

  @Get('manager-auditor')
  async getManagerAuditorMappings() {
    return await this.service.getManagerAuditorMappings();
  }

  @Get('manager-client')
  async getManagerClientMappings() {
    return await this.service.getManagerClientMappings();
  }

  @Post('manager-auditor')
  async addManagerAuditor(@Body() dto: CreateMappingDto, @Req() req: any) {
    return await this.service.addManagerAuditorMapping(dto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Delete('manager-auditor')
  async removeManagerAuditor(
    @Query('managerId') managerId: string,
    @Query('auditorId') auditorId: string,
    @Req() req: any
  ) {
    return await this.service.removeManagerAuditorMapping(managerId, auditorId, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Post('manager-client')
  async addManagerClient(@Body() dto: CreateMappingDto, @Req() req: any) {
    return await this.service.addManagerClientMapping(dto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Delete('manager-client')
  async removeManagerClient(
    @Query('managerId') managerId: string,
    @Query('clientId') clientId: string,
    @Req() req: any
  ) {
    return await this.service.removeManagerClientMapping(managerId, clientId, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }
}
