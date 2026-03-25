import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientCorrectiveActionsController } from './corrective-actions.controller';
import { ClientCorrectiveActionsService } from './corrective-actions.service';
import { CorrectiveActionPlan } from '../../database/entities/corrective-action-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CorrectiveActionPlan])],
  controllers: [ClientCorrectiveActionsController],
  providers: [ClientCorrectiveActionsService],
  exports: [ClientCorrectiveActionsService],
})
export class ClientCorrectiveActionsModule {}
