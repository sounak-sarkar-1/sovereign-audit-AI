import api from '@/lib/api';

export const ExceptionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ExceptionStatus = (typeof ExceptionStatus)[keyof typeof ExceptionStatus];


export interface ExceptionRequest {
  id: string;
  auditScopeLineItemId: string;
  auditScopeLineItem: any;
  auditorId: string;
  auditor: any;
  managerId: string;
  justification: string;
  status: ExceptionStatus;
  managerComment?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export const exceptionService = {
  getExceptions: async (auditId: string, status?: string): Promise<ExceptionRequest[]> => {
    const url = `/manager/audits/${auditId}/exceptions`;
    const response = await api.get(url, {
      params: { status },
    });
    return response;
  },

  approveException: async (auditId: string, exId: string, managerComment?: string) => {
    const response = await api.post(`/manager/audits/${auditId}/exceptions/${exId}/approve`, {
      managerComment,
    });
    return response;
  },

  rejectException: async (auditId: string, exId: string, managerComment: string) => {
    const response = await api.post(`/manager/audits/${auditId}/exceptions/${exId}/reject`, {
      managerComment,
    });
    return response;
  },
};
