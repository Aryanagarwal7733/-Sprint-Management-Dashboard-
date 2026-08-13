const REFRESH_TOKEN_KEY = 'sprintdesk_refresh_token';
const REMEMBER_ME_KEY = 'sprintdesk_remember_me';
const SESSION_EXPIRY_KEY = 'sprintdesk_session_expiry';

export const storage = {
  getRefreshToken: (): string | null => {
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    // Check if session has expired
    if (expiry) {
      const now = new Date().getTime();
      if (now > parseInt(expiry, 10)) {
        storage.clearAuth();
        return null;
      }
    }
    
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string, rememberMe: boolean): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
    
    const now = new Date().getTime();
    if (rememberMe) {
      // 30 days persistence
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(SESSION_EXPIRY_KEY, (now + thirtyDays).toString());
    } else {
      // Simulated 60 mins persistence for short-lived session
      const oneHour = 60 * 60 * 1000;
      localStorage.setItem(SESSION_EXPIRY_KEY, (now + oneHour).toString());
    }
  },

  clearAuth: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }
};
