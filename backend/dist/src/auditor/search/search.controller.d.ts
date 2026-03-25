import { AuditorSearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { User } from '../../database/entities/user.entity';
export declare class AuditorSearchController {
    private readonly service;
    constructor(service: AuditorSearchService);
    search(dto: SearchQueryDto, user: User): Promise<{
        jobId: string;
    }>;
    getJobStatus(id: string): Promise<import("../../database/entities/ai-job.entity").AiJob>;
}
