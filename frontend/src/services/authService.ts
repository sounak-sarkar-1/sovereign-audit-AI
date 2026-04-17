import api from '@/lib/api';

export const authService = {
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  resetPassword: async (email: string) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response;
  },

  confirmPasswordReset: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response;
  },
};
