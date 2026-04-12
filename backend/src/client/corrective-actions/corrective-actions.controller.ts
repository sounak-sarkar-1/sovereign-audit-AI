import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientCorrectiveActionsService } from './corrective-actions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../../database/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('client/corrective-actions')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientCorrectiveActionsController {
  constructor(private readonly service: ClientCorrectiveActionsService) {}

  @Get()
  findAll(
    @CurrentUser('id') clientId: string,
    @Query('auditId') auditId?: string,
  ) {
    return this.service.findAll(clientId, auditId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.service.findOne(id, clientId);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() data: any) {
    return this.service.create(user, data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') clientId: string,
    @Body() data: any,
  ) {
    return this.service.update(id, clientId, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('id') clientId: string) {
    return this.service.delete(id, clientId);
  }
}
