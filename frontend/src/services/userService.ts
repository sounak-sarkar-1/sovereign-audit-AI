import api from '@/lib/api';

export const userService = {
  getUsers: async (params: any = {}) => {
    const response = await api.get('/admin/users', { params });
    // Handle both { data, meta } and direct array if needed
    // UsersList expects { data, meta }, Dashboard expects { total }
    const result = response.data;
    if (result.meta) {
      return {
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages
      };
    }
    return result;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
};
