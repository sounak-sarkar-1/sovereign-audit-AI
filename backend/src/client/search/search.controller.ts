import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ClientSearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('client/search')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientSearchController {
  constructor(private readonly service: ClientSearchService) {}

  @Post()
  async search(@Body() dto: SearchQueryDto, @Request() req: any) {
    return this.service.search(dto, req.user.id);
  }
}