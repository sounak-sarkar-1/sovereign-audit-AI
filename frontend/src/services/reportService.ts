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

  download: async (auditId: string, reportId: string, filename: string = 'report.docx') => {
    const response = await api.get(`/manager/audits/${auditId}/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    
    // Create a link element, trigger download, and cleanup
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  uploadVersion: async (auditId: string, reportId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/manager/audits/${auditId}/reports/${reportId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};
