import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Audit } from '../../database/entities/audit.entity';
import { ExceptionalActionRequest } from '../../database/entities/exceptional-action-request.entity';
import { AdminSummaryService } from './summary.service';
import { AdminSummaryController } from './summary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Audit, ExceptionalActionRequest])],
  controllers: [AdminSummaryController],
  providers: [AdminSummaryService],
})
export class AdminSummaryModule {}
