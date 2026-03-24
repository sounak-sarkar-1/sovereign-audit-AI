import { AdminAiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
export declare class AdminAiModelsController {
    private readonly service;
    constructor(service: AdminAiModelsService);
    create(dto: CreateAiModelDto, req: any): Promise<import("../../database/entities/ai-model.entity").AiModel>;
    findAll(): Promise<import("../../database/entities/ai-model.entity").AiModel[]>;
    findOne(id: string): Promise<import("../../database/entities/ai-model.entity").AiModel>;
    update(id: string, dto: UpdateAiModelDto, req: any): Promise<import("../../database/entities/ai-model.entity").AiModel>;
    remove(id: string, req: any): Promise<void>;
    activate(id: string, req: any): Promise<void>;
    test(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
