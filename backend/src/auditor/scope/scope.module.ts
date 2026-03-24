import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditorScopeController } from './scope.controller';
import { AuditorScopeService } from './scope.service';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { LineItemResponse } from '../../database/entities/line-item-response.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';
import { AuditorLineItemAssignment } from '../../database/entities/auditor-line-item-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditScopeLineItem,
      LineItemResponse,
      AuditBusinessUnit,
      AuditorLineItemAssignment,
    ]),
  ],
  controllers: [AuditorScopeController],
  providers: [AuditorScopeService],
  exports: [AuditorScopeService],
})
export class AuditorScopeModule {}