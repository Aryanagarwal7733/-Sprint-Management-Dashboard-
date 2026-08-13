import { create } from 'zustand';
import type { User } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  logout: () => void;
  verifySession: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password, rememberMe) => {
    try {
      // Check Admin credentials
      if (email === 'aryanagarwal610@gmail.com') {
        if (password === '7teSy0@1') {
          const user: User = {
            id: 9999,
            username: 'aryanagarwal610@gmail.com',
            email: 'aryanagarwal610@gmail.com',
            firstName: 'Aryan',
            lastName: 'Agarwal',
            gender: 'male',
            role: 'admin',
            image: 'https://dummyjson.com/icon/emilys/128',
          };
          const accessToken = `mock-jwt-access::aryanagarwal610@gmail.com::${Date.now()}`;
          const refreshToken = `mock-jwt-refresh::aryanagarwal610@gmail.com::${Date.now()}`;

          storage.setRefreshToken(refreshToken, rememberMe);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return user;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      // Check local registered users first
      const registeredUsersJson = localStorage.getItem('sprintdesk_registered_users');
      const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      const localUser = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (localUser) {
        if (localUser.password === password) {
          const { password: _, ...userData } = localUser;
          const accessToken = `mock-jwt-access::${localUser.username}::${Date.now()}`;
          const refreshToken = `mock-jwt-refresh::${localUser.username}::${Date.now()}`;

          storage.setRefreshToken(refreshToken, rememberMe);

          set({
            user: userData,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return userData;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      // If not admin and not registered user, fail authentication
      throw new Error('Invalid username or password');
    } catch (error) {
      get().logout();
      throw error;
    }
  },

  logout: () => {
    storage.clearAuth();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  verifySession: async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      set({ isLoading: false, isAuthenticated: false, user: null, accessToken: null });
      return;
    }

    // Check if this is a locally registered simulated session
    if (refreshToken.startsWith('mock-jwt-refresh::')) {
      try {
        const username = refreshToken.split('::')[1];

        if (username === 'aryanagarwal610@gmail.com') {
          const user: User = {
            id: 9999,
            username: 'aryanagarwal610@gmail.com',
            email: 'aryanagarwal610@gmail.com',
            firstName: 'Aryan',
            lastName: 'Agarwal',
            gender: 'male',
            role: 'admin',
            image: 'https://dummyjson.com/icon/emilys/128',
          };
          const newAccessToken = `mock-jwt-access::aryanagarwal610@gmail.com::${Date.now()}`;
          const newRefreshToken = `mock-jwt-refresh::aryanagarwal610@gmail.com::${Date.now()}`;

          const rememberMe = localStorage.getItem('sprintdesk_remember_me') === 'true';
          storage.setRefreshToken(newRefreshToken, rememberMe);

          set({
            user,
            accessToken: newAccessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        const registeredUsersJson = localStorage.getItem('sprintdesk_registered_users');
        const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
        const localUser = registeredUsers.find((u: any) => u.username === username);

        if (localUser) {
          const { password: _, ...userData } = localUser;
          const newAccessToken = `mock-jwt-access::${username}::${Date.now()}`;
          const newRefreshToken = `mock-jwt-refresh::${username}::${Date.now()}`;

          const rememberMe = localStorage.getItem('sprintdesk_remember_me') === 'true';
          storage.setRefreshToken(newRefreshToken, rememberMe);

          set({
            user: userData,
            accessToken: newAccessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        console.error('Local session verification failed:', e);
      }
    }

    // If it's not a local token, log out immediately
    get().logout();
  },

  setTokens: (accessToken, refreshToken) => {
    const rememberMe = localStorage.getItem('sprintdesk_remember_me') === 'true';
    storage.setRefreshToken(refreshToken, rememberMe);
    set({ accessToken });
  },

  getRefreshToken: () => {
    return storage.getRefreshToken();
  },
}));
