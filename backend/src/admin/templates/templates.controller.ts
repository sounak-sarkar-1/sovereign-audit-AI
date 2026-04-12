import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UserRole } from '../../database/entities/user.entity';

@Controller('admin/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.templatesService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      search,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateTemplateDto, @Req() req: any) {
    return this.templatesService.create(createDto, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTemplateDto,
    @Req() req: any,
  ) {
    return this.templatesService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.templatesService.remove(id, req.user.id);
  }
}
