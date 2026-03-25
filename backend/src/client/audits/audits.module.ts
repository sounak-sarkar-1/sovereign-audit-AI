import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientAuditsController } from './audits.controller';
import { ClientAuditsService } from './audits.service';
import { Audit } from '../../database/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  controllers: [ClientAuditsController],
  providers: [ClientAuditsService],
  exports: [ClientAuditsService]
})
export class ClientAuditsModule {}