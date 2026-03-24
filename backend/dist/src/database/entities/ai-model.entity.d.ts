import { User } from './user.entity';
export declare enum AiModelType {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    GOOGLE = "google",
    SLM = "slm",
    OPEN_SOURCE = "open_source",
    OTHER = "other"
}
export declare class AiModel {
    id: string;
    name: string;
    modelType: AiModelType;
    endpointUrl: string;
    apiKeyEnc: string;
    isActive: boolean;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
