import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiJobsModule } from '../../shared/ai-jobs/ai-jobs.module';
import { ClientSearchController } from './search.controller';
import { ClientSearchService } from './search.service';
import { AiJob } from '../../database/entities/ai-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiJob]), AiJobsModule],
  controllers: [ClientSearchController],
  providers: [ClientSearchService],
  exports: [ClientSearchService],
})
export class ClientSearchModule {}
