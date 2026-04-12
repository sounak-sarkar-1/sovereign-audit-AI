import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { AuditTemplate } from '../../database/entities/audit-template.entity';
import { AuditTemplateLineItem } from '../../database/entities/audit-template-line-item.entity';
import { AuditTemplateOption } from '../../database/entities/audit-template-option.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditTemplate,
      AuditTemplateLineItem,
      AuditTemplateOption,
    ]),
    AuditTrailModule,
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
