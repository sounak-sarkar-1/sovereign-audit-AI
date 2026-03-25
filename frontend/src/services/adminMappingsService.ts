import api from '@/lib/api';

export interface Mapping {
  managerId: string;
  targetId: string; // auditorId or clientId
}

export const adminMappingsService = {
  getMappings: async (type: 'manager-auditor' | 'manager-client') => {
    const response = await api.get(`/admin/mappings/${type}`);
    return response.data;
  },

  createMapping: async (type: 'manager-auditor' | 'manager-client', data: Mapping) => {
    const response = await api.post(`/admin/mappings/${type}`, data);
    return response.data;
  },

  removeMapping: async (type: 'manager-auditor' | 'manager-client', managerId: string, targetId: string) => {
    const targetQuery = type === 'manager-auditor' ? 'auditorId' : 'clientId';
    const response = await api.delete(`/admin/mappings/${type}?managerId=${managerId}&${targetQuery}=${targetId}`);
    return response.data;
  }
};
