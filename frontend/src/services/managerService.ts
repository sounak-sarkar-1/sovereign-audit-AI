import api from '../lib/api';

export const managerService = {
  // Audits
  getAudits: async (params?: any) => {
    return await api.get('/manager/audits', { params });
  },
  getAuditDetail: async (id: string) => {
    return await api.get(`/manager/audits/${id}`);
  },
  updateAudit: async (id: string, data: any) => {
    return await api.put(`/manager/audits/${id}`, data);
  },
  startAudit: async (id: string) => {
    return await api.post(`/manager/audits/${id}/start`);
  },
  archiveAudit: async (id: string) => {
    return await api.post(`/manager/audits/${id}/archive`);
  },
  getAuditTrail: async (id: string) => {
    return await api.get(`/manager/audits/${id}/trail`);
  },
  
  // Clients
  getClients: async () => {
    return await api.get('/manager/clients');
  },
  
  // Chat
  getMessages: async (auditId: string) => {
    return await api.get(`/manager/chats/${auditId}`);
  },
  sendMessage: async (auditId: string, content: string) => {
    return await api.post(`/manager/chats/${auditId}`, { content });
  },
  markAsRead: async (auditId: string) => {
    return await api.post(`/manager/chats/${auditId}/read`);
  },
  
  // Settings
  getSettings: async () => {
    return await api.get('/manager/settings');
  },
  updateSettings: async (data: any) => {
    return await api.put('/manager/settings', data);
  },
};
