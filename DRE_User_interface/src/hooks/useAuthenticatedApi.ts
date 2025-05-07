import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosInstance, AxiosError } from 'axios';
import { useAuth } from './useAuth';
import { useTokenChange } from './useTokenChange';

/**
 * Hook to create an authenticated API client that automatically updates when the token changes
 */
export const useAuthenticatedApi = () => {
  const { accessToken, isAuthenticated, apiInitialized } = useAuth();
  const [apiClient, setApiClient] = useState<AxiosInstance>(() => createApiClient(accessToken));
  const tokenRef = useRef<string | null | undefined>(accessToken);
  
  // Function to create a new API client with the current token
  const createApiClient = useCallback((token: string | null | undefined) => {
    console.log('🔧 Creating new API client with token:', token ? '(token exists)' : '(no token)');
    tokenRef.current = token;
    
    const client = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    
    // Add request interceptor to ensure the latest token is used
    client.interceptors.request.use((config) => {
      // If the token has changed since this client was created, update the header
      if (tokenRef.current && tokenRef.current !== token) {
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }
      return config;
    });
    
    return client;
  }, []);
  
  // Update the API client when the token changes via useAuth
  useEffect(() => {
    if (accessToken !== tokenRef.current) {
      console.log('🔄 Token changed in useAuth, updating API client');
      setApiClient(createApiClient(accessToken));
    }
  }, [accessToken, createApiClient]);
  
  // Also listen for token changes via the token change system
  useTokenChange((newToken) => {
    console.log('🔄 Token changed via notification system, updating API client');
    tokenRef.current = newToken;
    setApiClient(createApiClient(newToken));
  });
  
  // Wrapper function for making authenticated API requests
  const makeRequest = useCallback(async <T>(config: AxiosRequestConfig): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error('User is not authenticated');
    }
    
    if (!apiInitialized) {
      throw new Error('API is not initialized');
    }
    
    try {
      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('API request failed:', {
        status: axiosError.response?.status,
        url: config.url,
        method: config.method,
        error: axiosError.message
      });
      throw error;
    }
  }, [apiClient, isAuthenticated, apiInitialized]);
  
  return {
    makeRequest,
    apiClient,
    isReady: isAuthenticated && apiInitialized,
  };
};
