import { OnModuleInit } from '@nestjs/common';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
import { Repository } from 'typeorm';
import { AiJob } from '../../database/entities/ai-job.entity';
export declare class ScopeExtractionWorker implements OnModuleInit {
    private readonly aiJobsService;
    private readonly aiJobRepository;
    private readonly logger;
    constructor(aiJobsService: AiJobsService, aiJobRepository: Repository<AiJob>);
    onModuleInit(): Promise<void>;
    processJob(jobId: string): Promise<void>;
}
