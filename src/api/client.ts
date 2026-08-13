import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const authClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach Bearer token to dummyjson client
authClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s and refresh tokens
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and this request hasn't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue the request until token refresh is complete
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authClient.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint directly using native axios to bypass authClient interceptors
        const refreshResponse = await axios.post<{ accessToken: string; refreshToken: string }>(
          'https://dummyjson.com/auth/refresh',
          {
            refreshToken,
            expiresInMins: 30,
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Save tokens in Zustand and localStorage via authStore
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Process the queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authClient.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
