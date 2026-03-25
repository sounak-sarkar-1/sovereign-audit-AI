import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ManagerSettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('manager/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ManagerSettingsController {
  constructor(private readonly service: ManagerSettingsService) {}

  @Get()
  getSettings(@Request() req: any) {
    return this.service.getSettings(req.user.id);
  }

  @Put()
  updateSettings(@Request() req: any, @Body() data: any) {
    return this.service.updateSettings(req.user.id, data);
  }
}
