import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Post()
  create(@Body() createDto: CreateUserDto, @Req() req: any) {
    return this.service.create(createDto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Get()
  findAll(@Query() query: UserFilterDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.service.update(id, updateDto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Query('force') force?: string,
  ) {
    return this.service.remove(id, force === 'true', {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }
}
