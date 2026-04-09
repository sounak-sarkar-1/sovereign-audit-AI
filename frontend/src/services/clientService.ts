import api from '@/lib/api';

export const clientService = {
  // Audits
  getAudits: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/client/audits', { params });
    return response.data;
  },

  getAuditDetail: async (id: string) => {
    const response = await api.get(`/client/audits/${id}`);
    return response.data;
  },

  getAuditProgress: async (auditId: string) => {
    const response = await api.get(`/client/audits/${auditId}/progress`);
    return response.data;
  },

  // Insights
  getInsights: async (params?: { auditId?: string }) => {
    const response = await api.get('/client/insights', { params });
    return response.data;
  },

  getAuditInsights: async (auditId: string) => {
    const response = await api.get(`/client/insights`, { params: { auditId } });
    return response.data;
  },

  // Clarifications
  getClarifications: async (params?: { status?: string }) => {
    const response = await api.get('/client/clarifications', { params });
    return response.data;
  },

  getClarificationDetail: async (id: string) => {
    const response = await api.get(`/client/clarifications/${id}`);
    return response.data;
  },

  respondToClarification: async (id: string, message: string, attachmentFileIds?: string[]) => {
    const response = await api.post(`/client/clarifications/${id}/respond`, { message, attachmentFileIds });
    return response.data;
  },

  // Reports
  getReports: async () => {
    const response = await api.get('/client/reports');
    return response.data;
  },

  getReportDetail: async (id: string) => {
    const response = await api.get(`/client/reports/${id}`);
    return response.data;
  },

  submitReportFeedback: async (id: string, feedback: any[]) => {
    const response = await api.post(`/client/reports/${id}/feedback`, { feedback });
    return response.data;
  },

  downloadReport: async (id: string, filename: string) => {
    const response = await api.get(`/client/reports/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Corrective Actions
  getCorrectiveActions: async (params?: { auditId?: string }) => {
    const response = await api.get('/client/corrective-actions', { params });
    return response.data;
  },

  createCorrectiveAction: async (data: any) => {
    const response = await api.post('/client/corrective-actions', { ...data });
    return response.data;
  },

  updateCorrectiveAction: async (id: string, data: any) => {
    const response = await api.put(`/client/corrective-actions/${id}`, data);
    return response.data;
  },

  // Chat
  getChatMessages: async (auditId: string) => {
    const response = await api.get(`/client/chats/${auditId}`);
    return response.data;
  },

  sendChatMessage: async (auditId: string, content: string) => {
    const response = await api.post(`/client/chats/${auditId}`, { content });
    return response.data;
  },

  markChatMessageAsRead: async (auditId: string) => {
    const response = await api.post(`/client/chats/${auditId}/read`);
    return response.data;
  },

  // Search
  search: async (query: string) => {
    const response = await api.post('/client/search', { query });
    return response.data;
  },
};
