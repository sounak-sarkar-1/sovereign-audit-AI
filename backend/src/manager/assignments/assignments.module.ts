import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerAssignmentsController } from './assignments.controller';
import { ManagerAssignmentsService } from './assignments.service';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditorLineItemAssignment } from '../../database/entities/auditor-line-item-assignment.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditorAuditAssignment,
      AuditorLineItemAssignment,
      Audit,
      AuditBusinessUnit,
      AuditScopeLineItem,
      ManagerAuditorMapping,
    ]),
    AuditTrailModule,
  ],
  controllers: [ManagerAssignmentsController],
  providers: [ManagerAssignmentsService],
  exports: [ManagerAssignmentsService],
})
export class ManagerAssignmentsModule {}