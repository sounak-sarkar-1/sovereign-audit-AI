import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { AuditTrailService } from './audit-trail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrailLog])],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
