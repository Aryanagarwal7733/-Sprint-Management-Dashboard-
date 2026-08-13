import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('sprintdesk_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    });
  },
  initTheme: () => {
    const saved = localStorage.getItem('sprintdesk_theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const active = saved || (systemDark ? 'dark' : 'light');
    
    if (active === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: active });
  }
}));
