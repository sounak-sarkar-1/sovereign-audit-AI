import api from '../lib/api';

export const managerService = {
  // Audits
  getAudits: async (params?: any) => {
    const response = await api.get('/manager/audits', { params });
    return response.data;
  },
  getAuditDetail: async (id: string) => {
    const response = await api.get(`/manager/audits/${id}`);
    return response.data;
  },
  updateAudit: async (id: string, data: any) => {
    const response = await api.put(`/manager/audits/${id}`, data);
    return response.data;
  },
  startAudit: async (id: string) => {
    const response = await api.post(`/manager/audits/${id}/start`);
    return response.data;
  },
  archiveAudit: async (id: string) => {
    const response = await api.post(`/manager/audits/${id}/archive`);
    return response.data;
  },
  getAuditTrail: async (id: string) => {
    const response = await api.get(`/manager/audits/${id}/trail`);
    return response.data;
  },
  
  // Clients
  getClients: async () => {
    const response = await api.get('/manager/clients');
    return response.data;
  },
  
  // Chat
  getMessages: async (auditId: string) => {
    const response = await api.get(`/manager/chats/${auditId}`);
    return response.data;
  },
  sendMessage: async (auditId: string, content: string) => {
    const response = await api.post(`/manager/chats/${auditId}`, { content });
    return response.data;
  },
  markAsRead: async (auditId: string) => {
    const response = await api.post(`/manager/chats/${auditId}/read`);
    return response.data;
  },
  
  // Settings
  getSettings: async () => {
    const response = await api.get('/manager/settings');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await api.put('/manager/settings', data);
    return response.data;
  },
};
