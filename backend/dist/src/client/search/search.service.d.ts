import { Repository, DataSource } from 'typeorm';
import { AiJob } from '../../database/entities/ai-job.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { AiJobsService } from '../../shared/ai-jobs/ai-jobs.service';
export declare class ClientSearchService {
    private readonly aiJobRepo;
    private readonly aiJobsService;
    private readonly dataSource;
    private readonly logger;
    constructor(aiJobRepo: Repository<AiJob>, aiJobsService: AiJobsService, dataSource: DataSource);
    search(dto: SearchQueryDto, clientId: string): Promise<{
        jobId: string;
    }>;
}
