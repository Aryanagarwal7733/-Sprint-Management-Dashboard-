import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { AuthGuard } from './features/auth/AuthGuard';
import { GuestGuard } from './features/auth/GuestGuard';
import { AppLayout } from './components/layout/AppLayout';

// Route-level Code Splitting (React.lazy + Suspense)
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const KanbanBoard = lazy(() => import('./features/board/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const UsersPage = lazy(() => import('./features/users/UsersPage').then(m => ({ default: m.UsersPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { verifySession, isLoading } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Initialize Theme
    initTheme();
    // Verify user session on start
    verifySession();
  }, [verifySession, initTheme]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border border-transparent border-t-violet-400 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-slate-400 text-sm font-medium tracking-wide animate-pulse">
          Loading SprintDesk...
        </p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500">
              <div className="w-12 h-12 border-4 border-violet-500/25 border-t-violet-500 rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
            {/* Guest Only Routes */}
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <LoginPage />
                </GuestGuard>
              }
            />

            {/* Authenticated Dashboard Routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="board" element={<KanbanBoard />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
