import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, BarChart3, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useToast } from '../../hooks/useToast';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully logged out of SprintDesk.',
      variant: 'info',
    });
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/board', label: 'Kanban Board', icon: KanbanSquare },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/20">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
          <KanbanSquare className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-300 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight">
          SprintDesk
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 block">
          Overview
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </NavLink>
        ))}
      </nav>

      {/* Actions & Profile Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-800 text-slate-500 rounded px-1.5 py-0.5">
            {theme.toUpperCase()}
          </span>
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/20 dark:border-slate-800/30 rounded-xl">
            <img
              src={user.image}
              alt={user.firstName}
              className="h-9 w-9 rounded-full bg-slate-200 object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                @{user.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
