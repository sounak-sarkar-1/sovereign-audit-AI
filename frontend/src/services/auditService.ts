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
    return await api.get<AuditListResponse>('/manager/audits', { params });
  },

  getAudit: async (id: string) => {
    return await api.get<Audit>(`/manager/audits/${id}`);
  },

  createAudit: async (data: CreateAuditDto) => {
    return await api.post<Audit>('/manager/audits', data);
  },

  updateAudit: async (id: string, data: UpdateAuditDto) => {
    return await api.put<Audit>(`/manager/audits/${id}`, data);
  },

  startAudit: async (id: string) => {
    return await api.post<Audit>(`/manager/audits/${id}/start`);
  },

  getClients: async () => {
    return await api.get<User[]>('/manager/clients');
  },

  getAssignments: async (auditId: string) => {
    return await api.get<any>(`/manager/audits/${auditId}/assignments`);
  },

  assignToBU: async (auditId: string, data: { auditorId: string; auditBusinessUnitId: string }) => {
    return await api.post(`/manager/audits/${auditId}/assignments`, data);
  },

  unassignFromBU: async (auditId: string, assignmentId: string) => {
    return await api.delete(`/manager/audits/${auditId}/assignments/${assignmentId}`);
  },

  assignToLineItem: async (auditId: string, data: { auditorId: string; lineItemId: string }) => {
    return await api.post(`/manager/audits/${auditId}/assignments/line-items`, data);
  },

  unassignFromLineItem: async (auditId: string, assignmentId: string) => {
    return await api.delete(`/manager/audits/${auditId}/assignments/line-items/${assignmentId}`);
  },

  getAuditTrail: async (auditId: string) => {
    return await api.get<any[]>(`/manager/audits/${auditId}/trail`);
  },
  getComplianceComparison: async (auditId: string) => {
    return await api.get<any>(`/manager/audits/${auditId}/compliance-comparison`);
  },
};
