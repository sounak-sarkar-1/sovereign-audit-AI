import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminBusinessUnitsService } from './business-units.service';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/clients/:clientId/business-units')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AdminBusinessUnitsController {
  constructor(private readonly service: AdminBusinessUnitsService) {}

  @Post()
  @Roles('admin')
  async create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateBusinessUnitDto,
    @Req() req: any,
  ) {
    return await this.service.create(clientId, dto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Get()
  @Roles('admin', 'manager')
  async findAll(@Param('clientId') clientId: string) {
    return await this.service.findAllByClient(clientId);
  }

  @Put(':buId')
  @Roles('admin')
  async update(
    @Param('clientId') clientId: string,
    @Param('buId') buId: string,
    @Body() dto: UpdateBusinessUnitDto,
    @Req() req: any,
  ) {
    return await this.service.update(clientId, buId, dto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Delete(':buId')
  @Roles('admin')
  async remove(
    @Param('clientId') clientId: string,
    @Param('buId') buId: string,
    @Req() req: any,
  ) {
    return await this.service.remove(clientId, buId, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }
}
