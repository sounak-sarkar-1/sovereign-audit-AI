import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Controller('shared/notifications')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin', 'manager', 'auditor', 'client')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: User, @Query() query: GetNotificationsDto) {
    return await this.service.findAllForUser(user.id, query);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    await this.service.markAsRead(id, user.id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    const updatedCount = await this.service.markAllAsRead(user.id);
    return { success: true, updatedCount };
  }
}