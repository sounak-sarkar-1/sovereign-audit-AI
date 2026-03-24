import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ManagerAuditsService } from './audits.service';
import { AuditStatus } from '../../database/entities/audit.entity';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ManagerAuditsController {
  constructor(private readonly auditsService: ManagerAuditsService) {}

  @Get('audits')
  async findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: AuditStatus,
  ) {
    return this.auditsService.findAll(req.user.id, page, limit, status);
  }

  @Post('audits')
  async create(@Request() req: any, @Body() createDto: CreateAuditDto) {
    return this.auditsService.create(createDto, req.user.id);
  }

  @Get('audits/:id')
  async findOne(@Param('id') id: string) {
    return this.auditsService.findOne(id);
  }

  @Put('audits/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAuditDto,
    @Request() req: any
  ) {
    return this.auditsService.update(id, updateDto, req.user.id);
  }

  @Post('audits/:id/start')
  async start(@Param('id') id: string, @Request() req: any) {
    return this.auditsService.start(id, req.user.id);
  }

  @Get('clients')
  async getClients(@Request() req: any) {
    return this.auditsService.getClients(req.user.id);
  }
}