import api from './api';

export const managerService = {
  // Audits
  getAudits: (params?: any) => api.get('/manager/audits', { params }),
  getAuditDetail: (id: string) => api.get(`/manager/audits/${id}`),
  updateAudit: (id: string, data: any) => api.put(`/manager/audits/${id}`, data),
  startAudit: (id: string) => api.post(`/manager/audits/${id}/start`),
  archiveAudit: (id: string) => api.post(`/manager/audits/${id}/archive`),
  getAuditTrail: (id: string) => api.get(`/manager/audits/${id}/trail`),
  
  // Clients
  getClients: () => api.get('/manager/clients'),
  
  // Chat
  getMessages: (auditId: string) => api.get(`/manager/chats/${auditId}`),
  sendMessage: (auditId: string, content: string) => api.post(`/manager/chats/${auditId}`, { content }),
  markAsRead: (auditId: string) => api.post(`/manager/chats/${auditId}/read`),
  
  // Settings
  getSettings: () => api.get('/manager/settings'),
  updateSettings: (data: any) => api.put('/manager/settings', data),
};
