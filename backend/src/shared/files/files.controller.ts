import {
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Post as PostMethod,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { FileEntityType } from '../../database/entities/uploaded-file.entity';

@Controller('shared/files')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('admin', 'manager', 'auditor', 'client')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: FileEntityType,
    @Body('entityId') entityId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.uploadFile(file, user.id, entityType, entityId);
  }

  @Patch(':id/annotations')
  async updateAnnotations(
    @Param('id') id: string,
    @Body('annotations') annotations: any,
  ) {
    return this.service.updateAnnotations(id, annotations);
  }
}
