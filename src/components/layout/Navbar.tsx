import React from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationBell } from '../../features/notifications/NotificationBell';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/board':
        return 'Sprint Board';
      case '/analytics':
        return 'Analytics & Visualisation';
      default:
        return 'SprintDesk';
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none margin-0">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Polling Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Greeting */}
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Welcome back, {user.firstName}
            </p>
            <p className="text-[10px] text-slate-400">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
