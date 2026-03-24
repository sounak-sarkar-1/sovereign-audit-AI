export type AiModelType = 'openai' | 'anthropic' | 'google' | 'slm' | 'open_source' | 'other';

export interface AiModel {
  id: string;
  name: string;
  modelType: AiModelType;
  endpointUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiModelPayload {
  name: string;
  modelType: AiModelType;
  endpointUrl: string;
  apiKey: string;
}

export interface UpdateAiModelPayload extends Partial<Omit<CreateAiModelPayload, 'apiKey'>> {
  apiKey?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}
