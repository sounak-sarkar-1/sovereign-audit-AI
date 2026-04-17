import api from '@/lib/api';

export interface AuditFilterParams {
  search?: string;
  status?: string;
  clientId?: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const adminAuditService = {
  getAudits: async (params: AuditFilterParams) => {
    const response = await api.get('/admin/audits', { params });
    return response;
  },

  getAuditById: async (id: string | undefined) => {
    if (!id) return null;
    const response = await api.get(`/admin/audits/${id}`);
    return response;
  },

  exportAudits: async (params: AuditFilterParams) => {
    const response = await api.get('/admin/audits/export', {
      params,
      responseType: 'blob',
    });
    
    // Create direct download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audits-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
