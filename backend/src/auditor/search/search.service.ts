import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AiJob, JobType, JobStatus } from '../../database/entities/ai-job.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';

@Injectable()
export class AuditorSearchService {
  private readonly logger = new Logger(AuditorSearchService.name);

  constructor(
    @InjectRepository(AiJob)
    private readonly aiJobRepo: Repository<AiJob>,
    private readonly aiJobsService: AiJobsService,
    private readonly dataSource: DataSource,
  ) {}

  async search(dto: SearchQueryDto, auditorId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // Create AI Job for Situational Research
      const aiJob = manager.create(AiJob, {
        jobType: JobType.NL_SEARCH, // Reusing NL_SEARCH for now, or could be a new enum if needed
        status: JobStatus.QUEUED,
        createdBy: auditorId,
        inputPayload: { 
            query: dto.query, 
            context: 'situational_research', 
            role: 'auditor' 
        },
      });
      const savedJob = await manager.save(aiJob);

      // Publish to pg-boss
      await this.aiJobsService.send('nl-search', { 
        jobId: savedJob.id,
        query: dto.query,
        auditorId 
      });

      return { jobId: savedJob.id };
    });
  }

  async getJobStatus(jobId: string) {
    return this.aiJobRepo.findOne({
      where: { id: jobId }
    });
  }
}
