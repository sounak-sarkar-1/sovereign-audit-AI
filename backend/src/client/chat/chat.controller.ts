import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from '../../shared/chat/chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../../database/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('client/chats')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':auditId')
  async getMessages(@Param('auditId') auditId: string) {
    return this.chatService.getMessages(auditId);
  }

  @Post(':auditId')
  async sendMessage(
    @Param('auditId') auditId: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.chatService.sendMessage(auditId, user, content);
  }

  @Post(':auditId/read')
  async markAsRead(
    @Param('auditId') auditId: string,
    @CurrentUser() user: User,
  ) {
    return this.chatService.markAsRead(auditId, user.id);
  }
}
