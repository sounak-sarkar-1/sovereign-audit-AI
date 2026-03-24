import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerAuditorsController } from './auditors.controller';
import { HeatmapService } from './heatmap.service';
import { User } from '../../database/entities/user.entity';
import { ManagerAuditorMapping } from '../../database/entities/manager-auditor-mapping.entity';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { Audit } from '../../database/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ManagerAuditorMapping,
      AuditorAuditAssignment,
      AuditScopeLineItem,
      Audit,
    ]),
  ],
  controllers: [ManagerAuditorsController],
  providers: [HeatmapService],
  exports: [HeatmapService],
})
export class ManagerAuditorsModule {}
