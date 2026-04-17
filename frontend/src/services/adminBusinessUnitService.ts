import api from '@/lib/api';

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  clientId: string;
  createdAt: string;
}

export const adminBusinessUnitService = {
  getClients: async () => {
    const response = await api.get('/admin/users', { params: { role: 'client', limit: 100 } });
    return response;
  },
  
  getBusinessUnits: async (clientId: string) => {
    const response = await api.get(`/admin/clients/${clientId}/business-units`);
    return response;
  },

  createBusinessUnit: async (clientId: string, data: { name: string; code: string }) => {
    const response = await api.post(`/admin/clients/${clientId}/business-units`, data);
    return response;
  },

  updateBusinessUnit: async (clientId: string, buId: string, data: { name: string; code: string }) => {
    const response = await api.put(`/admin/clients/${clientId}/business-units/${buId}`, data);
    return response;
  },

  deleteBusinessUnit: async (clientId: string, buId: string) => {
    const response = await api.delete(`/admin/clients/${clientId}/business-units/${buId}`);
    return response;
  }
};
