import api from '@/lib/api';

export const clientService = {
  // Audits
  getAudits: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/client/audits', { params });
    return response;
  },

  getAuditDetail: async (id: string) => {
    const response = await api.get(`/client/audits/${id}`);
    return response;
  },

  getAuditProgress: async (auditId: string) => {
    const response = await api.get(`/client/audits/${auditId}/progress`);
    return response;
  },

  // Insights
  getInsights: async (params?: { auditId?: string }) => {
    const response = await api.get('/client/insights', { params });
    return response;
  },

  getAuditInsights: async (auditId: string) => {
    const response = await api.get(`/client/insights`, { params: { auditId } });
    return response;
  },

  // Clarifications
  getClarifications: async (params?: { status?: string }) => {
    const response = await api.get('/client/clarifications', { params });
    return response;
  },

  getClarificationDetail: async (id: string) => {
    const response = await api.get(`/client/clarifications/${id}`);
    return response;
  },

  respondToClarification: async (id: string, message: string, attachmentFileIds?: string[]) => {
    const response = await api.post(`/client/clarifications/${id}/respond`, { message, attachmentFileIds });
    return response;
  },

  // Reports
  getReports: async () => {
    const response = await api.get('/client/reports');
    return response;
  },

  getReportDetail: async (id: string) => {
    const response = await api.get(`/client/reports/${id}`);
    return response;
  },

  submitReportFeedback: async (id: string, feedback: any[]) => {
    const response = await api.post(`/client/reports/${id}/feedback`, { feedback });
    return response;
  },

  finalizeReport: async (id: string) => {
    const response = await api.post(`/client/reports/${id}/finalize`);
    return response;
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
    return response;
  },

  createCorrectiveAction: async (data: any) => {
    const response = await api.post('/client/corrective-actions', { ...data });
    return response;
  },

  updateCorrectiveAction: async (id: string, data: any) => {
    const response = await api.put(`/client/corrective-actions/${id}`, data);
    return response;
  },

  // Chat
  getChatMessages: async (auditId: string) => {
    const response = await api.get(`/client/chats/${auditId}`);
    return response;
  },

  sendChatMessage: async (auditId: string, content: string) => {
    const response = await api.post(`/client/chats/${auditId}`, { content });
    return response;
  },

  markChatMessageAsRead: async (auditId: string) => {
    const response = await api.post(`/client/chats/${auditId}/read`);
    return response;
  },

  // Search
  search: async (query: string) => {
    const response = await api.post('/client/search', { query });
    return response;
  },

  getComplianceComparison: async (auditId: string) => {
    const response = await api.get(`/client/audits/${auditId}/compliance-comparison`);
    return response;
  },

  exportLineItems: async (auditId: string, auditName: string) => {
    const res: any = await api.get(
      `/client/audits/${auditId}/reports/export-line-items`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute(
      'download',
      `${auditName.replace(/\s+/g, '_')}_LineItems_${date}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
