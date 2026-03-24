import api from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
  createdAt: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const notificationService = {
  getNotifications: async (params?: GetNotificationsParams) => {
    const response = await api.get('/shared/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/shared/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/shared/notifications/read-all');
    return response.data;
  },
};
