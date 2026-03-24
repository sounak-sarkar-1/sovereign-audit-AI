import { AiJobsService } from './ai-jobs.service';
export declare class AiJobsController {
    private readonly service;
    constructor(service: AiJobsService);
    findOne(id: string): Promise<import("../../database/entities/ai-job.entity").AiJob>;
}
