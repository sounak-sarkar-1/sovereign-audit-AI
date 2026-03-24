import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAiModelsController } from './ai-models.controller';
import { AdminAiModelsService } from './ai-models.service';
import { AiModel } from '../../database/entities/ai-model.entity';
import { AuditTrailModule } from '../../shared/audit-trail/audit-trail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiModel]),
    AuditTrailModule,
  ],
  controllers: [AdminAiModelsController],
  providers: [AdminAiModelsService],
  exports: [AdminAiModelsService],
})
export class AdminAiModelsModule {}