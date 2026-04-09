import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientAuditsController } from './audits.controller';
import { ClientAuditsService } from './audits.service';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { AuditBusinessUnit } from '../../database/entities/audit-business-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit, AuditScopeLineItem, AuditBusinessUnit])],
  controllers: [ClientAuditsController],
  providers: [ClientAuditsService],
  exports: [ClientAuditsService]
})
export class ClientAuditsModule {}