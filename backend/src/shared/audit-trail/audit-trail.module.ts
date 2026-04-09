import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrailLog } from '../../database/entities/audit-trail-log.entity';
import { AuditTrailService } from './audit-trail.service';
import { AdminAuditTrailController } from '../../admin/audit-trail/audit-trail.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrailLog])],
  controllers: [AdminAuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}
