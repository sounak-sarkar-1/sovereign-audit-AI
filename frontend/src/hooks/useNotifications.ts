import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type GetNotificationsParams } from '@/services/notificationService';
import { toast } from 'sonner';

export const useNotifications = (params?: GetNotificationsParams, isHeader: boolean = false) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    refetchInterval: isHeader ? 30000 : false, // 30s polling for header bell
    staleTime: 5000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Failed to mark notification as read');
      console.error(error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error('Failed to mark all as read');
      console.error(error);
    },
  });

  return {
    ...query,
    notifications: query.data?.data || [],
    meta: query.data?.meta || { unreadCount: 0, total: 0 },
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
  };
};
