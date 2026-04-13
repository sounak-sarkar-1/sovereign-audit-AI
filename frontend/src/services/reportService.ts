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
    const res = await api.get(`/manager/audits/${auditId}/reports`);
    return res.data?.data ?? res.data ?? [];
  },

  generateReport: async (auditId: string) => {
    const res = await api.post(`/manager/audits/${auditId}/reports/generate`);
    return res.data?.data ?? res.data;
  },

  uploadVersion: async (auditId: string, reportId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(
      `/manager/audits/${auditId}/reports/${reportId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data?.data ?? res.data;
  },

  send: async (auditId: string, reportId: string) => {
    const res = await api.post(`/manager/audits/${auditId}/reports/${reportId}/send`);
    return res.data?.data ?? res.data;
  },

  finalize: async (auditId: string, reportId: string) => {
    const res = await api.post(`/manager/audits/${auditId}/reports/${reportId}/finalize`);
    return res.data?.data ?? res.data;
  },

  downloadReport: async (auditId: string, reportId: string, filename: string = 'report.docx') => {
    const res = await api.get(
      `/manager/audits/${auditId}/reports/${reportId}/download`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
