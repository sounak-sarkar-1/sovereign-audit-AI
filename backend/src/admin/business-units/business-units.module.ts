import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminBusinessUnitsController } from './business-units.controller';
import { AdminBusinessUnitsService } from './business-units.service';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessUnit, Audit]), AuditTrailModule],
  controllers: [AdminBusinessUnitsController],
  providers: [AdminBusinessUnitsService],
  exports: [AdminBusinessUnitsService],
})
export class AdminBusinessUnitsModule {}
