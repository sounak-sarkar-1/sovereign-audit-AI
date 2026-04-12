import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditorAuditsController } from './audits.controller';
import { AuditorAuditsService } from './audits.service';
import { AuditorAuditAssignment } from '../../database/entities/auditor-audit-assignment.entity';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { LineItemResponse } from '../../database/entities/line-item-response.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditorScopeModule } from '../scope/scope.module';
import { AuditorExceptionsModule } from '../exceptions/exceptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditorAuditAssignment,
      Audit,
      AuditScopeLineItem,
      LineItemResponse,
      AuditBusinessUnit,
    ]),
    AuditorScopeModule,
    AuditorExceptionsModule,
  ],
  controllers: [AuditorAuditsController],
  providers: [AuditorAuditsService],
  exports: [AuditorAuditsService],
})
export class AuditorAuditsModule {}
