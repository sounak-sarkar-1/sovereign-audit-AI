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
    const res = await api.get(`/ai-jobs/${jobId}`);
    return res.data?.data ?? res.data;
  },
};
