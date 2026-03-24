import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ManagerAssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssignAuditorDto } from './dto/assign-auditor.dto';
import { AssignLineItemDto } from './dto/assign-line-item.dto';

@Controller('manager/audits/:id/assignments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerAssignmentsController {
  constructor(private readonly service: ManagerAssignmentsService) {}

  @Get()
  async getAssignments(@Param('id') auditId: string) {
    return this.service.getAssignments(auditId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async assignToBU(
    @Param('id') auditId: string,
    @Body() dto: AssignAuditorDto,
    @CurrentUser('id') managerId: string,
  ) {
    return this.service.assignToBU(auditId, dto, managerId);
  }

  @Delete(':assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignFromBU(
    @Param('id') auditId: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentUser('id') managerId: string,
  ) {
    return this.service.unassignFromBU(auditId, assignmentId, managerId);
  }

  @Post('line-items')
  @HttpCode(HttpStatus.CREATED)
  async assignToLineItem(
    @Param('id') auditId: string,
    @Body() dto: AssignLineItemDto,
    @CurrentUser('id') managerId: string,
  ) {
    return this.service.assignToLineItem(auditId, dto, managerId);
  }

  @Delete('line-items/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignFromLineItem(
    @Param('id') auditId: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentUser('id') managerId: string,
  ) {
    return this.service.unassignFromLineItem(auditId, assignmentId, managerId);
  }
}