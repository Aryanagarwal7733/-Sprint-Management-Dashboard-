import { useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';
import { useNotificationStore } from '../../store/notificationStore';
import { useToast } from '../../hooks/useToast';

export const useNotificationPoll = (isPanelOpen: boolean) => {
  const { addNotifications } = useNotificationStore();
  const { toast } = useToast();
  const intervalRef = useRef<any>(null);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get<Array<{ id: number; title: string; body: string }>>('/posts?_limit=5');
      
      addNotifications(response.data, (title) => {
        if (!isPanelOpen) {
          toast({
            title: 'New Notification',
            description: title.length > 50 ? `${title.slice(0, 50)}...` : title,
            variant: 'info',
          });
        }
      });
    } catch (error) {
      console.error('Failed to poll notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const startPolling = () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchNotifications, 10000);
      }
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPanelOpen]);
};
