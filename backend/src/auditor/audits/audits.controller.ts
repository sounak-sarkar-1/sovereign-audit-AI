import { Controller, Get, Param, Put, Post, Body, UseGuards } from '@nestjs/common';
import { AuditorAuditsService } from './audits.service';
import { AuditorScopeService } from '../scope/scope.service';
import { AuditorExceptionsService } from '../exceptions/exceptions.service';
import { UpdateResponseDto } from '../scope/dto/update-response.dto';
import { CreateExceptionDto } from '../exceptions/dto/create-exception.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('auditor/audits')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('auditor')
export class AuditorAuditsController {
  constructor(
    private readonly service: AuditorAuditsService,
    private readonly scopeService: AuditorScopeService,
    private readonly exceptionsService: AuditorExceptionsService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user);
  }

  @Get('performance')
  getPerformance(@CurrentUser() user: User) {
    return this.service.getPerformance(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user);
  }

  @Get(':id/scope')
  getScope(@Param('id') id: string, @CurrentUser() user: User) {
    return this.scopeService.getScope(id, user);
  }

  @Put(':id/scope/:liId/response')
  updateResponse(
    @Param('id') id: string,
    @Param('liId') liId: string,
    @Body() dto: UpdateResponseDto,
    @CurrentUser() user: User,
  ) {
    return this.scopeService.updateResponse(id, liId, user, dto);
  }

  @Get(':id/exceptions')
  getExceptions(@Param('id') id: string, @CurrentUser() user: User) {
    return this.exceptionsService.findByAudit(id, user);
  }

  @Post(':id/exceptions')
  createException(
    @Param('id') id: string,
    @Body() dto: CreateExceptionDto,
    @CurrentUser() user: User,
  ) {
    return this.exceptionsService.create(id, user, dto);
  }

  @Get(':id/scope/:liId/comments')
  getScopeItemComments(@Param('liId') liId: string) {
    return this.scopeService.getComments(liId);
  }

  @Post(':id/scope/:liId/comments')
  addScopeItemComment(
    @Param('liId') liId: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.scopeService.addComment(liId, user, content);
  }
}