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
};

