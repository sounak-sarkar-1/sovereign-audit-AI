import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AuditorSearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('auditor/search')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('auditor')
export class AuditorSearchController {
  constructor(private readonly service: AuditorSearchService) {}

  @Post()
  search(@Body() dto: SearchQueryDto, @CurrentUser() user: User) {
    return this.service.search(dto, user.id);
  }

  @Get('jobs/:id')
  getJobStatus(@Param('id') id: string) {
    return this.service.getJobStatus(id);
  }
}
