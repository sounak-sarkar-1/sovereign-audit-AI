import { Controller, Post, Body, Param, UseGuards, UnprocessableEntityException } from '@nestjs/common';
import { ManagerExceptionalRequestsService } from './exceptional-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ExceptionalActionType } from '../../database/entities/exceptional-action-request.entity';

class CreateExceptionalRequestDto {
  actionType: ExceptionalActionType;
  justification: string;
}

@Controller('manager/audits/:id/exceptional-requests')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerExceptionalRequestsController {
  constructor(private readonly service: ManagerExceptionalRequestsService) {}

  @Post()
  create(
    @Param('id') auditId: string,
    @Body() dto: CreateExceptionalRequestDto,
    @CurrentUser() manager: User,
  ) {
    if (dto.justification.length < 20) {
      throw new UnprocessableEntityException('Justification must be at least 20 characters');
    }
    return this.service.create(auditId, dto, manager);
  }
}
