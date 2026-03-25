import { ClientSearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
export declare class ClientSearchController {
    private readonly service;
    constructor(service: ClientSearchService);
    search(dto: SearchQueryDto, req: any): Promise<{
        jobId: string;
    }>;
}
