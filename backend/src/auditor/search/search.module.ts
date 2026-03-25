import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditorSearchController } from './search.controller';
import { AuditorSearchService } from './search.service';
import { AiJob } from '../../database/entities/ai-job.entity';
import { AiJobsModule } from '../../shared/ai-jobs/ai-jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiJob]),
    AiJobsModule,
  ],
  controllers: [AuditorSearchController],
  providers: [AuditorSearchService],
  exports: [AuditorSearchService],
})
export class AuditorSearchModule {}
