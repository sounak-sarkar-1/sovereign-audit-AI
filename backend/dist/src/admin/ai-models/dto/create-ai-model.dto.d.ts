import { AiModelType } from '../../../database/entities/ai-model.entity';
export declare class CreateAiModelDto {
    name: string;
    modelType: AiModelType;
    endpointUrl: string;
    apiKey: string;
}
