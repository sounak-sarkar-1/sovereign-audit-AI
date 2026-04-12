import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerAuditsController } from './audits.controller';
import { ManagerAuditsService } from './audits.service';
import { Audit } from '../../database/entities/audit.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { User } from '../../database/entities/user.entity';
import { ManagerClientMapping } from '../../database/entities/manager-client-mapping.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { BusinessUnit } from '../../database/entities/business-unit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Audit,
      AuditBusinessUnit,
      User,
      ManagerClientMapping,
      AuditorAuditAssignment,
      BusinessUnit,
      ExceptionalActionRequest,
    ]),
    AuditTrailModule,
  ],
  controllers: [ManagerAuditsController],
  providers: [ManagerAuditsService],
  exports: [ManagerAuditsService],
})
export class ManagerAuditsModule {}
