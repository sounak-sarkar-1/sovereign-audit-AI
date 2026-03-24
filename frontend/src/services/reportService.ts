import api from '@/lib/api';

export interface AuditReport {
  id: string;
  auditId: string;
  fileId: string;
  version: number;
  status: 'draft' | 'sent_for_client_review' | 'final';
  managerNotes: string;
  createdAt: string;
  file?: {
    id: string;
    originalFilename: string;
  };
}

export const reportService = {
  generateReport: async (auditId: string) => {
    const response = await api.post(`/manager/audits/${auditId}/reports/generate`);
    return response.data;
  },

  getReports: async (auditId: string): Promise<AuditReport[]> => {
    const response = await api.get(`/manager/audits/${auditId}/reports`);
    return response.data;
  },

  sendToClient: async (auditId: string, reportId: string) => {
    const response = await api.post(`/manager/audits/${auditId}/reports/${reportId}/send-to-client`);
    return response.data;
  },

  finalize: async (auditId: string, reportId: string) => {
    const response = await api.post(`/manager/audits/${auditId}/reports/${reportId}/finalize`);
    return response.data;
  },

  download: async (auditId: string, reportId: string) => {
    window.open(`${import.meta.env.VITE_API_URL}/manager/audits/${auditId}/reports/${reportId}/download`, '_blank');
  }
};
