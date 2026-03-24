import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClientClarificationsService } from './clarifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RespondToClarificationDto } from './dto/respond-clarification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('client/clarifications')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('client')
export class ClientClarificationsController {
  constructor(private readonly service: ClientClarificationsService) {}

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body() dto: RespondToClarificationDto,
    @CurrentUser() user: User,
  ) {
    return this.service.respond(id, dto, user);
  }
}