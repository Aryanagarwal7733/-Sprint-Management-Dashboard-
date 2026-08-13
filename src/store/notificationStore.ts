import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string; // post ID
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotifications: (
    posts: Array<{ id: number; title: string; body: string }>,
    onNewNotification: (title: string) => void
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotifications: (posts, onNewNotification) => {
        const currentNotifications = get().notifications;
        const currentIds = new Set(currentNotifications.map((n) => n.id));
        const newNotifications: NotificationItem[] = [];

        // Reverse to add older posts first, keeping newest at the top
        [...posts].reverse().forEach((post) => {
          const idStr = String(post.id);
          if (!currentIds.has(idStr)) {
            newNotifications.push({
              id: idStr,
              title: post.title,
              body: post.body,
              read: false,
              timestamp: new Date().toISOString(),
            });
            // Trigger callback for toast notification
            onNewNotification(post.title);
          }
        });

        if (newNotifications.length === 0) return;

        // Prepend new notifications and slice to keep the latest 20
        const updatedList = [...newNotifications, ...currentNotifications].slice(0, 20);

        set({ notifications: updatedList });
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'sprintdesk_notifications_store',
    }
  )
);
