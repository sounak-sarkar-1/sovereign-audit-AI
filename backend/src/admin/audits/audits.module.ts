import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuditsController } from './audits.controller';
import { AdminAuditsService } from './audits.service';
import { Audit } from '../../database/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  controllers: [AdminAuditsController],
  providers: [AdminAuditsService],
  exports: [AdminAuditsService],
})
export class AdminAuditsModule {}