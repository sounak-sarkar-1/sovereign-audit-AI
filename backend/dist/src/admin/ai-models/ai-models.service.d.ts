import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiModel } from '../../database/entities/ai-model.entity';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { AuditTrailService } from '../../shared/audit-trail/audit-trail.service';
export declare class AdminAiModelsService {
    private readonly repository;
    private readonly configService;
    private readonly auditTrailService;
    private readonly dataSource;
    private readonly logger;
    private readonly encryptionKey;
    constructor(repository: Repository<AiModel>, configService: ConfigService, auditTrailService: AuditTrailService, dataSource: DataSource);
    create(createDto: CreateAiModelDto, creatorId: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<AiModel>;
    findAll(): Promise<AiModel[]>;
    findOne(id: string): Promise<AiModel>;
    update(id: string, updateDto: UpdateAiModelDto, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<AiModel>;
    activate(id: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
    remove(id: string, actor: {
        id: string;
        role: string;
        ip: string;
    }): Promise<void>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
