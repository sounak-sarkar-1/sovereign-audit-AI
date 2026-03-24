import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMappingsController } from './mappings.controller';
import { AdminMappingsService } from './mappings.service';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagerAuditorMapping, ManagerClientMapping]),
    AuditTrailModule,
  ],
  controllers: [AdminMappingsController],
  providers: [AdminMappingsService],
  exports: [AdminMappingsService],
})
export class AdminMappingsModule {}
