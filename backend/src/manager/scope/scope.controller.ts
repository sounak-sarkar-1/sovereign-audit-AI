import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ManagerScopeService } from './scope.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CreateScopeItemsDto } from './dto/create-scope-items.dto';
import { UpdateScopeItemDto } from './dto/update-scope-item.dto';
import { ImportFromTemplateDto } from './dto/import-from-template.dto';
import { ConfirmExcelImportDto } from './dto/confirm-excel-import.dto';
import { UpdateWeightagesDto } from './dto/update-weightages.dto';

@Controller('manager/audits/:auditId/scope')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('manager')
export class ManagerScopeController {
  constructor(private readonly service: ManagerScopeService) {}

  @Get()
  findAll(@Param('auditId', ParseUUIDPipe) auditId: string) {
    return this.service.findAll(auditId);
  }

  @Post('line-items')
  create(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: CreateScopeItemsDto,
  ) {
    return this.service.createLineItems(auditId, dto);
  }

  @Put('weightages')
  async updateWeightages(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: UpdateWeightagesDto,
  ) {
    return this.service.updateWeightages(auditId, dto);
  }

  @Post('weightages/distribute-equally')
  async distributeEqualWeightage(@Param('auditId', ParseUUIDPipe) auditId: string) {
    return this.service.distributeEqualWeightage(auditId);
  }

  @Post('line-items/batch')
  createBatch(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: CreateScopeItemsDto,
  ) {
    return this.service.createLineItems(auditId, dto);
  }

  @Put('line-items/:lineItemId')
  update(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Param('lineItemId', ParseUUIDPipe) lineItemId: string,
    @Body() dto: UpdateScopeItemDto,
  ) {
    return this.service.updateLineItem(auditId, lineItemId, dto);
  }

  @Delete('line-items/:lineItemId')
  remove(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Param('lineItemId', ParseUUIDPipe) lineItemId: string,
  ) {
    return this.service.removeLineItem(auditId, lineItemId);
  }

  @Post('import-from-template')
  importFromTemplate(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: ImportFromTemplateDto,
  ) {
    return this.service.importFromTemplate(auditId, dto);
  }

  @Post('extract-from-document')
  @UseInterceptors(FileInterceptor('document'))
  extractFromDocument(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('auditBusinessUnitId', ParseUUIDPipe) buId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.extractFromDocument(auditId, file, buId, user.id);
  }

  @Post('import-from-excel')
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('auditBusinessUnitId', ParseUUIDPipe) buId: string,
  ) {
    return this.service.importFromExcel(auditId, file, buId);
  }

  @Post('import-from-excel/:importId/confirm')
  confirmExcelImport(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Param('importId', ParseUUIDPipe) importId: string,
    @Body() dto: ConfirmExcelImportDto,
  ) {
    return this.service.confirmExcelImport(auditId, importId, dto);
  }
}
