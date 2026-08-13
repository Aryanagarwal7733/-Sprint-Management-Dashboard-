import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { authClient } from './client';
import { useAuthStore } from '../store/authStore';

// Mock axios post globally for the refresh endpoint call
vi.mock('axios', async () => {
  const actual: any = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  };
});

describe('Axios Client Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('should append Authorization header if accessToken is present in store', async () => {
    useAuthStore.setState({ accessToken: 'mock-access-token' });

    // Retrieve request interceptor handler
    const requestHandler = (authClient.interceptors.request as any).handlers[0].fulfilled;

    const mockConfig = { headers: {} };
    const resultConfig = requestHandler(mockConfig);

    expect(resultConfig.headers.Authorization).toBe('Bearer mock-access-token');
  });

  it('should trigger silent token refresh on 401 and retry the original request', async () => {
    // 1. Set up store with a refresh token
    useAuthStore.setState({ accessToken: 'expired-access-token' });
    
    // Stub local storage and getRefreshToken
    vi.spyOn(useAuthStore.getState(), 'getRefreshToken').mockReturnValue('mock-refresh-token');
    const setTokensSpy = vi.spyOn(useAuthStore.getState(), 'setTokens');

    // Mock axios.post to resolve successfully for the refresh call
    const mockNewAccessToken = 'new-access-token';
    const mockNewRefreshToken = 'new-refresh-token';
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
      },
    });

    // Mock authClient to resolve the retried request
    const mockClientResponse = { data: 'success-data' };
    vi.spyOn(authClient, 'request').mockResolvedValue(mockClientResponse as any);

    // Retrieve response interceptor error handler
    const errorHandler = (authClient.interceptors.response as any).handlers[0].rejected;

    const mockError = {
      response: { status: 401 },
      config: {
        url: '/users/me',
        headers: {},
        _retry: false,
      },
    };

    // Execute interceptor
    const resultPromise = errorHandler(mockError);

    // Let microtasks flush
    await expect(resultPromise).resolves.toBe(mockClientResponse);

    // Verify refresh token call
    expect(axios.post).toHaveBeenCalledWith('https://dummyjson.com/auth/refresh', {
      refreshToken: 'mock-refresh-token',
      expiresInMins: 30,
    });

    // Verify token updates in store
    expect(setTokensSpy).toHaveBeenCalledWith(mockNewAccessToken, mockNewRefreshToken);
  });

  it('should log out the user if the refresh token call fails', async () => {
    useAuthStore.setState({ accessToken: 'expired-token' });
    vi.spyOn(useAuthStore.getState(), 'getRefreshToken').mockReturnValue('bad-refresh-token');
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');

    // Mock refresh failure
    vi.mocked(axios.post).mockRejectedValue(new Error('Refresh failed'));

    const errorHandler = (authClient.interceptors.response as any).handlers[0].rejected;

    const mockError = {
      response: { status: 401 },
      config: {
        url: '/users/me',
        headers: {},
        _retry: false,
      },
    };

    await expect(errorHandler(mockError)).rejects.toThrow('Refresh failed');
    expect(logoutSpy).toHaveBeenCalled();
  });
});
