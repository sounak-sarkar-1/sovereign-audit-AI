import api from '@/lib/api';

export interface AIJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
}

export const aiJobsService = {
  getJob: async (jobId: string): Promise<AIJob> => {
    const response = await api.get(`/shared/ai-jobs/${jobId}`);
    return response.data;
  }
};
