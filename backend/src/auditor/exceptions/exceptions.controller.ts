import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuditorExceptionsService } from './exceptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('auditor/exceptions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('auditor')
export class AuditorExceptionsController {
  constructor(private readonly service: AuditorExceptionsService) {}

  @Get()
  findAllGlobal(@CurrentUser() user: User) {
    return this.service.findAllGlobal(user);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.service.getComments(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.service.addComment(id, user, content);
  }
}