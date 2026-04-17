import api from '@/lib/api';

export const auditorService = {
  getHeatmap: async (auditId?: string) => {
    const response = await api.get('/manager/auditors/heatmap', {
      params: auditId ? { auditId } : {},
    });
    return response;
  },
  getAudits: async () => {
    const response = await api.get('/auditor/audits');
    return response;
  },
  getAuditDetail: async (id: string) => {
    const response = await api.get(`/auditor/audits/${id}`);
    return response;
  },
  getScope: async (id: string) => {
    const response = await api.get(`/auditor/audits/${id}/scope`);
    return response;
  },
  updateResponse: async (auditId: string, liId: string, data: any) => {
    const response = await api.put(`/auditor/audits/${auditId}/scope/${liId}/response`, data);
    return response;
  },
  createException: async (auditId: string, data: any) => {
    const response = await api.post(`/auditor/audits/${auditId}/exceptions`, data);
    return response;
  },
  getExceptions: async (auditId: string) => {
    const response = await api.get(`/auditor/audits/${auditId}/exceptions`);
    return response;
  },
  getExceptionComments: async (exceptionId: string) => {
    const response = await api.get(`/auditor/exceptions/${exceptionId}/comments`);
    return response;
  },
  addExceptionComment: async (exceptionId: string, content: string) => {
    const response = await api.post(`/auditor/exceptions/${exceptionId}/comments`, { content });
    return response;
  },
  getGlobalExceptions: async () => {
    const response = await api.get('/auditor/exceptions');
    return response;
  },
  search: async (query: string) => {
    const response = await api.post('/auditor/search', { query });
    return response;
  },
  getSearchJobStatus: async (jobId: string) => {
    const response = await api.get(`/auditor/search/jobs/${jobId}`);
    return response;
  },
  getChatMessages: async (auditId: string) => {
    const response = await api.get(`/auditor/chats/${auditId}`);
    return response;
  },
  sendChatMessage: async (auditId: string, content: string) => {
    const response = await api.post(`/auditor/chats/${auditId}`, { content });
    return response;
  },
  markChatMessageAsRead: async (auditId: string) => {
    const response = await api.post(`/auditor/chats/${auditId}/read`);
    return response;
  },
  getLineItemComments: async (auditId: string, liId: string) => {
    const response = await api.get(`/auditor/audits/${auditId}/scope/${liId}/comments`);
    return response;
  },
  addLineItemComment: async (auditId: string, liId: string, content: string) => {
    const response = await api.post(`/auditor/audits/${auditId}/scope/${liId}/comments`, { content });
    return response;
  },
  getPerformance: async () => {
    const response = await api.get('/auditor/audits/performance');
    return response;
  },
};

