import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AiJob, JobType, JobStatus } from '../../database/entities/ai-job.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';

@Injectable()
export class ClientSearchService {
  private readonly logger = new Logger(ClientSearchService.name);

  constructor(
    @InjectRepository(AiJob)
    private readonly aiJobRepo: Repository<AiJob>,
    private readonly aiJobsService: AiJobsService,
    private readonly dataSource: DataSource,
  ) {}

  async search(dto: SearchQueryDto, clientId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // Create AI Job
      const aiJob = manager.create(AiJob, {
        jobType: JobType.NL_SEARCH,
        status: JobStatus.QUEUED,
        createdBy: clientId,
        inputPayload: { query: dto.query, clientId },
      });
      const savedJob = await manager.save(aiJob);

      // Publish to pg-boss
      await this.aiJobsService.send('nl-search', { 
        jobId: savedJob.id,
        query: dto.query,
        clientId 
      });

      return { jobId: savedJob.id };
    });
  }
}
