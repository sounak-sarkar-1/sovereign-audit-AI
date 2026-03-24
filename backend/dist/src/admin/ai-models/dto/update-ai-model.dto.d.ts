import { CreateAiModelDto } from './create-ai-model.dto';
declare const UpdateAiModelDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateAiModelDto, "apiKey">>>;
export declare class UpdateAiModelDto extends UpdateAiModelDto_base {
    apiKey?: string;
}
export {};
