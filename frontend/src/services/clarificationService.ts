import api from '@/lib/api';

export interface CreateClarificationDto {
  clientId: string;
  message: string;
  relatedExceptionId?: string;
  auditId: string;
}

export const clarificationService = {
  getClarifications: async (status?: string) => {
    const response = await api.get('/manager/clarifications', { params: { status } });
    return response.data;
  },

  getClarificationThread: async (id: string) => {
    const response = await api.get(`/manager/clarifications/${id}`);
    return response.data;
  },

  createClarification: async (auditId: string, dto: CreateClarificationDto) => {
    const response = await api.post(`/manager/clarifications/audits/${auditId}`, dto);
    return response.data;
  },

  respond: async (id: string, message: string) => {
    const response = await api.post(`/client/clarifications/${id}/respond`, { message });
    return response.data;
  },

  close: async (id: string) => {
    const response = await api.post(`/manager/clarifications/${id}/close`);
    return response.data;
  },
};
