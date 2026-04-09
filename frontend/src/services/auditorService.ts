import api from '@/lib/api';

export const auditorService = {
  getHeatmap: async (auditId?: string) => {
    const response = await api.get('/manager/auditors/heatmap', {
      params: auditId ? { auditId } : {},
    });
    return response.data;
  },
  getAudits: async () => {
    const response = await api.get('/auditor/audits');
    return response.data;
  },
  getAuditDetail: async (id: string) => {
    const response = await api.get(`/auditor/audits/${id}`);
    return response.data;
  },
  getScope: async (id: string) => {
    const response = await api.get(`/auditor/audits/${id}/scope`);
    return response.data;
  },
  updateResponse: async (auditId: string, liId: string, data: any) => {
    const response = await api.put(`/auditor/audits/${auditId}/scope/${liId}/response`, data);
    return response.data;
  },
  createException: async (auditId: string, data: any) => {
    const response = await api.post(`/auditor/audits/${auditId}/exceptions`, data);
    return response.data;
  },
  getExceptions: async (auditId: string) => {
    const response = await api.get(`/auditor/audits/${auditId}/exceptions`);
    return response.data;
  },
  getExceptionComments: async (exceptionId: string) => {
    const response = await api.get(`/auditor/exceptions/${exceptionId}/comments`);
    return response.data;
  },
  addExceptionComment: async (exceptionId: string, content: string) => {
    const response = await api.post(`/auditor/exceptions/${exceptionId}/comments`, { content });
    return response.data;
  },
  getGlobalExceptions: async () => {
    const response = await api.get('/auditor/exceptions');
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.post('/auditor/search', { query });
    return response.data;
  },
  getSearchJobStatus: async (jobId: string) => {
    const response = await api.get(`/auditor/search/jobs/${jobId}`);
    return response.data;
  },
  getChatMessages: async (auditId: string) => {
    const response = await api.get(`/auditor/chats/${auditId}`);
    return response.data;
  },
  sendChatMessage: async (auditId: string, content: string) => {
    const response = await api.post(`/auditor/chats/${auditId}`, { content });
    return response.data;
  },
  markChatMessageAsRead: async (auditId: string) => {
    const response = await api.post(`/auditor/chats/${auditId}/read`);
    return response.data;
  },
  getLineItemComments: async (auditId: string, liId: string) => {
    const response = await api.get(`/auditor/audits/${auditId}/scope/${liId}/comments`);
    return response.data;
  },
  addLineItemComment: async (auditId: string, liId: string, content: string) => {
    const response = await api.post(`/auditor/audits/${auditId}/scope/${liId}/comments`, { content });
    return response.data;
  },
  getPerformance: async () => {
    const response = await api.get('/auditor/audits/performance');
    return response.data;
  },
};

