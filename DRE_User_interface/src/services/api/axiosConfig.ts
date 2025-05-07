// axiosConfig.ts
// Global axios configuration for API requests

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthContextType } from '../providers/AuthProvider';

// Define CustomInternalAxiosRequestConfig type to include _retry flag and _needsAuth
export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _needsAuth?: boolean;
}

// Create a global axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the authentication token for all requests
export const setAuthToken = (token: string): void => {
  if (!token) {
    console.warn('Attempted to set empty auth token');
    return;
  }
  
  // Check if the token is already set to the same value
  const currentToken = axiosInstance.defaults.headers.common['Authorization'];
  if (currentToken === `Bearer ${token}`) {
    // Token is already set to the same value, no need to set it again
    return;
  }
  
  console.log('Setting auth token:', token.substring(0, 10) + '...');
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Process any queued requests with the new token
  processQueue(token);
};

// Function to clear the authentication token
// export const clearAuthToken = (): void => {
//   console.log('Clearing auth token');
//   delete axiosInstance.defaults.headers.common['Authorization'];
// };

// Add request interceptor for logging and authentication handling
axiosInstance.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    // Log the request details
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
    
    // Check if Authorization header is present
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    if (!authHeader) {
      console.warn(`⚠️ No Authorization header for request to ${config.url}`);
      
      // Add a custom flag to indicate this request might need to be retried with auth
      config._needsAuth = true;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Flag to track if a token refresh is in progress
let isRefreshingToken = false;
// Queue of requests that should be retried after token refresh
let refreshQueue: Array<(token: string) => void> = [];

// Process the queue of failed requests
const processQueue = (newToken: string | null) => {
  if (newToken) {
    console.log(`🔄 Processing ${refreshQueue.length} queued requests with new token`);
    // Retry each request in the queue with the new token
    refreshQueue.forEach(callback => callback(newToken));
  } else {
    console.log(`❌ Rejecting ${refreshQueue.length} queued requests due to authentication failure`);
  }
  // Clear the queue
  refreshQueue = [];
  // Reset the refreshing flag
  isRefreshingToken = false;
};

// Add response interceptor for logging, token refresh, and error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log the response details
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Special handling for 401 Unauthorized errors
      if (error.response.status === 401 && !originalRequest._retry) {
        console.log('🔄 Token expired. Attempting to refresh...');
        
        // Mark this request as being retried to prevent infinite loops
        originalRequest._retry = true;
        
        // If we're already refreshing the token, add this request to the queue
        if (isRefreshingToken) {
          console.log('🔄 Token refresh already in progress, adding request to queue');
          return new Promise(resolve => {
            refreshQueue.push((newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              }
              resolve(axiosInstance(originalRequest));
            });
          });
        }
        
        // Set the flag to indicate we're refreshing the token
        isRefreshingToken = true;
        
        try {
          // Get the auth context to access the token refresh function
          const authContext = getAuthContext();
          
          if (authContext) {
            // Refresh the token
            const newToken = await authContext.handleUnAuthorizedError();
            
            if (newToken) {
              console.log('🔑 Token refreshed successfully. Retrying request...');
              
              // Update the Authorization header with the new token
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              }
              
              // Process the queue with the new token
              processQueue(newToken);
              
              // Retry the original request with the new token
              return axiosInstance(originalRequest);
            } else {
              console.error('❌ Failed to refresh token');
              // If we couldn't refresh the token, redirect to login
              processQueue(null);
              authContext.logout();
              return Promise.reject(error);
            }
          }
        } catch (refreshError) {
          console.error('❌ Error refreshing token:', refreshError);
          // Process the queue with null to reject all pending requests
          processQueue(null);
          // If there was an error refreshing the token, redirect to login
          const authContext = getAuthContext();
          if (authContext) {
            authContext.logout();
          }
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
      
      // Check if this might be a CORS error or network error due to expired token
      // CORS errors typically don't have a response and occur after token expiration
      if (!originalRequest._retry) {
        console.log('🔄 Possible CORS error due to expired token. Attempting to refresh...');
        
        // Mark this request as being retried to prevent infinite loops
        originalRequest._retry = true;
        
        // Get the auth context
        const authContext = getAuthContext();
        
        if (authContext) {
          try {
            // Try to refresh the token first
            const newToken = await authContext.handleUnAuthorizedError();
            
            if (newToken) {
              console.log('🔑 Token refreshed successfully. Retrying request...');
              
              // Update the Authorization header with the new token
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              }
              
              // Process any queued requests
              processQueue(newToken);
              
              // Retry the original request with the new token
              return axiosInstance(originalRequest);
            } else {
              console.error('❌ Failed to refresh token during network error recovery');
              processQueue(null);
              authContext.logout();
              return Promise.reject(new Error('Authentication failed during network error recovery'));
            }
          } catch (refreshError) {
            console.error('❌ Error refreshing token:', refreshError);
            processQueue(null);
            authContext.logout();
            return Promise.reject(refreshError);
          }
        }
      }
    } else {
      console.error('❌ Error setting up request:', error.message);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Mark that we're retrying this request
      originalRequest._retry = true;
      
      try {
        console.log('🔄 Received 401, attempting to refresh token...');
        
        // Try to get a new token from sessionStorage
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Found refresh token, attempting to refresh access token...');
          
          // Here we would typically call an auth refresh endpoint
          // For now, we'll just reject to avoid infinite loops
          return Promise.reject(error);
        } else {
          console.log('No refresh token found, redirecting to login...');
          // Redirect to login page or handle as needed
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return Promise.reject(error);
      }
    }
    
    // Log other errors
    console.error(`❌ API Error: ${error.response?.status}`, {
      url: originalRequest.url,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// Helper function to get the auth context
let authContextValue: AuthContextType | undefined;

export const setAuthContext = (context: AuthContextType): void => {
  authContextValue = context;
};

export const getAuthContext = (): AuthContextType | undefined => {
  return authContextValue;
};

// Function to initialize the API
export const initializeApi = async (): Promise<unknown> => {
  try {
    console.log('Initializing API...');
    console.log('API Base URL:', import.meta.env.VITE_BASE_URL);
    const authHeader = axiosInstance.defaults.headers.common['Authorization'];
    console.log('Current auth header:', authHeader || 'None');
    
    const response = await axiosInstance.get('/api/Assessment/initialize');
    console.log('API initialized successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to initialize API:', error);
    throw error;
  }
};

export default axiosInstance;
