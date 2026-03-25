import api from '@/lib/api';
import type { 
  Audit, 
  AuditListResponse, 
  CreateAuditDto, 
  UpdateAuditDto,
  AuditStatus
} from '@/types/audit';
import type { User } from '@/stores/auth';

export const auditService = {
  getAudits: async (params?: { page?: number; limit?: number; status?: AuditStatus }) => {
    const response = await api.get<AuditListResponse>('/manager/audits', { params });
    return response.data;
  },

  getAudit: async (id: string) => {
    const response = await api.get<Audit>(`/manager/audits/${id}`);
    return response.data;
  },

  createAudit: async (data: CreateAuditDto) => {
    const response = await api.post<Audit>('/manager/audits', data);
    return response.data;
  },

  updateAudit: async (id: string, data: UpdateAuditDto) => {
    const response = await api.put<Audit>(`/manager/audits/${id}`, data);
    return response.data;
  },

  startAudit: async (id: string) => {
    const response = await api.post<Audit>(`/manager/audits/${id}/start`);
    return response.data;
  },

  getClients: async () => {
    const response = await api.get<User[]>('/manager/clients');
    return response.data;
  },

  getAssignments: async (auditId: string) => {
    const response = await api.get<any>(`/manager/audits/${auditId}/assignments`);
    return response.data;
  },

  assignToBU: async (auditId: string, data: { auditorId: string; auditBusinessUnitId: string }) => {
    const response = await api.post(`/manager/audits/${auditId}/assignments`, data);
    return response.data;
  },

  unassignFromBU: async (auditId: string, assignmentId: string) => {
    const response = await api.delete(`/manager/audits/${auditId}/assignments/${assignmentId}`);
    return response.data;
  },

  assignToLineItem: async (auditId: string, data: { auditorId: string; lineItemId: string }) => {
    const response = await api.post(`/manager/audits/${auditId}/assignments/line-items`, data);
    return response.data;
  },

  unassignFromLineItem: async (auditId: string, assignmentId: string) => {
    const response = await api.delete(`/manager/audits/${auditId}/assignments/line-items/${assignmentId}`);
    return response.data;
  },

  getAuditTrail: async (auditId: string) => {
    const response = await api.get<any[]>(`/manager/audits/${auditId}/trail`);
    return response.data;
  },
};
