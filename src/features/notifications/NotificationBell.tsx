import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useNotificationPoll } from './useNotificationPoll';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  // Run the polling hook
  useNotificationPoll(isOpen);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
        aria-label="Toggle notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-xl z-50 overflow-hidden text-left border border-slate-200/50 dark:border-slate-800/50 animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-all"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${!item.read ? 'bg-violet-50/30 dark:bg-violet-500/5' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-normal ${!item.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="h-2 w-2 rounded-full bg-violet-600 shrink-0 self-center" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                <span>All caught up! No notifications.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
