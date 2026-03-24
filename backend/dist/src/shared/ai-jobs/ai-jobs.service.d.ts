import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { type WorkHandler } from 'pg-boss';
import { AiJob } from '../../database/entities/ai-job.entity';
export declare class AiJobsService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly aiJobRepository;
    private readonly logger;
    private boss;
    constructor(configService: ConfigService, aiJobRepository: Repository<AiJob>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    send(queue: string, data: any, options?: any): Promise<string>;
    work<T = any>(queue: string, handler: WorkHandler<T>): Promise<string>;
    findOne(id: string): Promise<AiJob>;
}
