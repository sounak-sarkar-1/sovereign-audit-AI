import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientInsightsController } from './insights.controller';
import { ClientInsightsService } from './insights.service';
import { Audit } from '../../database/entities/audit.entity';
import { AuditScopeLineItem } from '../../database/entities/audit-scope-line-item.entity';
import { ExceptionRequest } from '../../database/entities/exception-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit, AuditScopeLineItem, ExceptionRequest])],
  controllers: [ClientInsightsController],
  providers: [ClientInsightsService],
  exports: [ClientInsightsService]
})
export class ClientInsightsModule {}