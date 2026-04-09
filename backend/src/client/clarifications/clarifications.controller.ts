import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ClientClarificationsService } from './clarifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../../database/entities/user.entity';
import { ClarificationStatus } from '../../database/entities/clarification-request.entity';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('client/clarifications')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientClarificationsController {
  constructor(private readonly service: ClientClarificationsService) {}

  @Get()
  async findAll(@CurrentUser('id') clientId: string, @Query('status') status?: ClarificationStatus) {
    return this.service.findAll(clientId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.service.findOne(id, clientId);
  }

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('attachmentFileIds') attachmentFileIds: string[],
    @CurrentUser() client: User,
  ) {
    if (!message || message.trim().length < 2) {
      throw new BadRequestException('Reply message cannot be empty');
    }
    return this.service.respond(id, client.id, message, attachmentFileIds);
  }
}