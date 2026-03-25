import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from '../../shared/chat/chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('manager/chats')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerChatController {
  constructor(private readonly service: ChatService) {}

  @Get(':auditId')
  getMessages(@Param('auditId') auditId: string) {
    return this.service.getMessages(auditId);
  }

  @Post(':auditId')
  sendMessage(
    @Param('auditId') auditId: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.service.sendMessage(auditId, user, content);
  }

  @Post(':auditId/read')
  markAsRead(@Param('auditId') auditId: string, @CurrentUser() user: User) {
    return this.service.markAsRead(auditId, user.id);
  }
}
