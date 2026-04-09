import { Controller, Post, Get, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ManagerClarificationsService } from './clarifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateClarificationDto } from './dto/create-clarification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ClarificationStatus } from '../../database/entities/clarification-request.entity';

@Controller('manager/clarifications')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerClarificationsController {
  constructor(private readonly service: ManagerClarificationsService) {}

  @Get()
  findAll(
    @Query('status') status?: ClarificationStatus,
    @CurrentUser() manager?: User,
  ) {
    return this.service.findAll(status, manager);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/close')
  close(
    @Param('id') id: string,
    @CurrentUser() manager: User,
  ) {
    return this.service.close(id, manager);
  }

  @Post('audits/:auditId')
  create(
    @Param('auditId') auditId: string,
    @Body() dto: CreateClarificationDto,
    @CurrentUser() manager: User,
  ) {
    dto.auditId = auditId;
    return this.service.create(dto, manager);
  }

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body('message') message: string,
    @CurrentUser() manager: User,
  ) {
    if (!message || message.trim().length < 5) {
      throw new BadRequestException('Reply message is too short');
    }
    return this.service.respond(id, message, manager);
  }
}