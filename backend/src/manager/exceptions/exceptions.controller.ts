import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ManagerExceptionsService } from './exceptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApproveExceptionDto, RejectExceptionDto } from './dto/exception-action.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ExceptionStatus } from '../../database/entities/exception-request.entity';

@Controller('manager/audits/:id/exceptions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerExceptionsController {
  constructor(private readonly service: ManagerExceptionsService) {}

  @Get()
  findAll(
    @Param('id') auditId: string,
    @Query('status') status?: ExceptionStatus,
    @CurrentUser() manager?: User,
  ) {
    if (auditId === 'all') {
      return this.service.findAllGlobal(status, manager);
    }
    return this.service.findAll(auditId, status);
  }

  @Post(':exId/approve')
  approve(
    @Param('exId') exId: string,
    @Body() dto: ApproveExceptionDto,
    @CurrentUser() manager: User,
  ) {
    return this.service.approve(exId, dto, manager);
  }

  @Post(':exId/reject')
  reject(
    @Param('exId') exId: string,
    @Body() dto: RejectExceptionDto,
    @CurrentUser() manager: User,
  ) {
    return this.service.reject(exId, dto, manager);
  }
}