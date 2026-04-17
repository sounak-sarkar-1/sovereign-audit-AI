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
    return response;
  },

  getClarificationThread: async (id: string) => {
    const response = await api.get(`/manager/clarifications/${id}`);
    return response;
  },

  createClarification: async (auditId: string, dto: CreateClarificationDto) => {
    const response = await api.post(`/manager/clarifications/audits/${auditId}`, dto);
    return response;
  },

  respond: async (id: string, message: string) => {
    const response = await api.post(`/client/clarifications/${id}/respond`, { message });
    return response;
  },

  close: async (id: string) => {
    const response = await api.post(`/manager/clarifications/${id}/close`);
    return response;
  },
};
