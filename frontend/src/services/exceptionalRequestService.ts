import api from '@/lib/api';

export type ExceptionalActionType = 'delete' | 'reopen';

export const ExceptionalActionType = {
  DELETE: 'delete' as const,
  REOPEN: 'reopen' as const,
};

export interface ExceptionalActionRequest {
  id: string;
  auditId: string;
  actionType: ExceptionalActionType;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const exceptionalRequestService = {
  createRequest: async (auditId: string, actionType: ExceptionalActionType, justification: string) => {
    const response = await api.post(`/manager/audits/${auditId}/exceptional-requests`, {
      actionType,
      justification,
    });
    return response.data;
  },

  // Admin endpoints
  getRequests: async (status?: string) => {
    const response = await api.get('/admin/exceptional-requests', {
      params: { status },
    });
    return response.data;
  },

  getRequestDetail: async (id: string) => {
    const response = await api.get(`/admin/exceptional-requests/${id}`);
    return response.data;
  },

  approveRequest: async (id: string, formData: FormData) => {
    const response = await api.post(`/admin/exceptional-requests/${id}/approve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  rejectRequest: async (id: string, adminComment: string) => {
    const response = await api.post(`/admin/exceptional-requests/${id}/reject`, {
      adminComment,
    });
    return response.data;
  },
};
