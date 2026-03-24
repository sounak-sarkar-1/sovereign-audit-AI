import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AdminAiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/ai-models')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin')
export class AdminAiModelsController {
  constructor(private readonly service: AdminAiModelsService) {}

  @Post()
  async create(@Body() dto: CreateAiModelDto, @Req() req: any) {
    return await this.service.create(dto, req.user.id, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAiModelDto,
    @Req() req: any
  ) {
    return await this.service.update(id, dto, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.service.remove(id, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string, @Req() req: any) {
    return await this.service.activate(id, {
      id: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }

  @Post(':id/test')
  async test(@Param('id') id: string) {
    return await this.service.testConnection(id);
  }
}