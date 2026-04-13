import api from '@/lib/api';

export interface AuditReport {
  id: string;
  auditId: string;
  version: number;
  status: 'draft' | 'sent_for_client_review' | 'feedback_submitted' | 'final';
  fileId: string | null;
  file?: { 
    id: string; 
    originalFilename: string;
  };
  managerNotes?: string;
  createdAt: string;
  updatedAt: string;
  feedbacks?: any[];
}

export const reportService = {
  getReports: async (auditId: string): Promise<AuditReport[]> => {
    return await api.get(`/manager/audits/${auditId}/reports`);
  },

  generateReport: async (auditId: string) => {
    return await api.post(`/manager/audits/${auditId}/reports/generate`);
  },

  uploadVersion: async (auditId: string, reportId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(
      `/manager/audits/${auditId}/reports/${reportId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  sendToClient: async (auditId: string, reportId: string) => {
    return await api.post(`/manager/audits/${auditId}/reports/${reportId}/send`);
  },

  finalize: async (auditId: string, reportId: string) => {
    return await api.post(`/manager/audits/${auditId}/reports/${reportId}/finalize`);
  },

  downloadReport: async (auditId: string, reportId: string, filename: string = 'report.docx') => {
    const res: any = await api.get(
      `/manager/audits/${auditId}/reports/${reportId}/download`,
      { responseType: 'blob' }
    );
    // Since interceptor now returns RAW data, 'res' IS the blob.
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
