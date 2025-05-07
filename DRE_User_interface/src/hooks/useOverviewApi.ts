// useOverviewApi.ts
// Custom hook to provide authenticated access to overview APIs

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { setAuthToken } from '../services/api/axiosConfig';
import axiosInstance from '../services/api/axiosConfig';
import { getOrders, Order } from '../services/mockData/ordersMockApi';
import { formatDateToDisplay } from '../utils/dateFormatUtils';

// Define the Job type based on the API response
export interface Job {
  jobKey: string;
  datetime: string;
  datetimeStr: string;
  energySource: string;
  plan: string;
  progress: string;
  parameters: string;
  downloadUrl?: string; // Legacy single URL (keeping for backward compatibility)
  downloadUrls?: string[]; // Array of download URLs
}

export interface JobsResponse {
  jobs: Job[];
}

// Re-export the Order type from ordersMockApi
export type { Order };

// Define a custom error type for API errors
interface ApiErrorResponse {
  response?: {
    status: number;
    data?: unknown;
  };
  message?: string;
}

/**
 * Custom hook that provides access to all overview API functions
 * This hook ensures the global authentication token is set before making API calls
 * and checks that the API has been initialized
 */
export const useOverviewApi = () => {
  const { accessToken, apiInitialized, handleUnAuthorizedError } = useAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);

  // Ensure the auth token is set whenever it changes
  useEffect(() => {
    if (accessToken && accessToken !== currentToken) {
      setAuthToken(accessToken);
      setCurrentToken(accessToken);
    }
  }, [accessToken, currentToken]);

  // Helper function to check if we can make API calls
  const checkApiReady = useCallback(() => {
    if (!accessToken) {
      throw new Error('Authentication token is missing');
    }
    
    if (!apiInitialized) {
      throw new Error('API has not been initialized yet');
    }
    
    return true;
  }, [accessToken, apiInitialized]);

  // Type guard to check if an error is an API error
  const isApiError = (error: unknown): error is ApiErrorResponse => {
    return (
      typeof error === 'object' && 
      error !== null && 
      ('response' in error || 'message' in error)
    );
  };

  // Helper function to handle API errors, with token refresh if needed
  const handleApiError = useCallback(async <T>(error: unknown, retryFn: () => Promise<T>): Promise<T> => {
    console.error('❌ API Error:', error);
    
    // Check if this is an authentication error (401)
    const isAuthError = isApiError(error) && 
                        error.response?.status === 401;
    
    const isCorsError = isApiError(error) && 
                        (error.message?.includes('CORS') || 
                        !error.response);
                        
    const currentTime = Date.now();
    const refreshCooldown = 10000; // 10 seconds between refresh attempts
    
    // Only attempt to refresh token if:
    // 1. It's an auth error or CORS error (which might be due to expired token)
    // 2. We're not already refreshing
    // 3. We haven't attempted a refresh in the last 10 seconds
    if ((isAuthError || isCorsError) && 
        !isRefreshing && 
        (currentTime - lastRefreshAttempt > refreshCooldown)) {
      
      console.log('🔄 Attempting to refresh token due to API error...');
      setIsRefreshing(true);
      setLastRefreshAttempt(currentTime);
      
      try {
        // Use the auth context's token refresh function
        const newToken = await handleUnAuthorizedError();
        
        if (newToken) {
          console.log('✅ Token refreshed successfully, retrying request...');
          setIsRefreshing(false);
          
          // Retry the original request with the new token
          return await retryFn();
        } else {
          console.error('❌ Token refresh failed');
          setIsRefreshing(false);
          throw error;
        }
      } catch (refreshError) {
        console.error('❌ Error during token refresh:', refreshError);
        setIsRefreshing(false);
        throw error;
      }
    } else {
      // If it's not an auth error or we can't refresh now, just throw the original error
      throw error;
    }
  }, [handleUnAuthorizedError, isRefreshing, lastRefreshAttempt]);

  // Helper function to validate and fix dates
  const validateAndFixDates = (jobs: Job[]): Job[] => {
    return jobs.map((job, index) => {
      try {
        // Check both datetime and datetimeStr fields
        const date1 = job.datetime ? new Date(job.datetime) : null;
        const date2 = job.datetimeStr ? new Date(job.datetimeStr) : null;

        if (date1 && isNaN(date1.getTime())) {
          console.warn(`❌ Job at index ${index} has invalid datetime:`, job.datetime);
        }

        if (date2 && isNaN(date2.getTime())) {
          console.warn(`❌ Job at index ${index} has invalid datetimeStr:`, job.datetimeStr);
        }

        // If one is valid and the other isn't, fix it
        if (date1 && !isNaN(date1.getTime()) && (!date2 || isNaN(date2.getTime()))) {
          console.log(`🔧 Fixing invalid datetimeStr for job ${job.jobKey}`);
          job.datetimeStr = job.datetime;
        } else if (date2 && !isNaN(date2.getTime()) && (!date1 || isNaN(date1.getTime()))) {
          console.log(`🔧 Fixing invalid datetime for job ${job.jobKey}`);
          job.datetime = job.datetimeStr;
        }

        // Try to format dates nicely for display if needed
        if (job.datetime && /^\d{4}-\d{2}-\d{2}/.test(job.datetime)) {
          // Only format if it's in ISO format
          const formattedDate = formatDateToDisplay(job.datetime.split('T')[0]);
          if (formattedDate) {
            job.datetimeStr = formattedDate;
          }
        }
      } catch (e) {
        console.error(`❌ Error parsing date for job at index ${index}:`, e);
      }
      return job;
    });
  };

  // Fetch user jobs
  const fetchUserJobs = useCallback(async (): Promise<JobsResponse> => {
    const fetchJobsRequest = async (): Promise<JobsResponse> => {
      try {
        checkApiReady();
        const response = await axiosInstance.get<JobsResponse>('/api/Jobs/userJobs');
        console.log('✅ API Response:', response.data);
        
        // Check if we have any jobs with invalid dates
        if (response.data?.jobs?.length > 0) {
          console.log(
            '📅 All job data:',
            response.data.jobs
          );
          
          // Validate and fix dates
          response.data.jobs = validateAndFixDates(response.data.jobs);
        }
        
        return response.data;
      } catch (error) {
        return handleApiError(error, fetchJobsRequest);
      }
    };
    
    try {
      return await fetchJobsRequest();
    } catch (error) {
      console.error('❌ Failed to fetch user jobs after retry:', error);
      // Return empty jobs array on error
      return { jobs: [] };
    }
  }, [checkApiReady, handleApiError]);

  // Fetch visualization data for a job
  const fetchVisualizationData = useCallback(async (jobKey: string, energySource: string): Promise<unknown> => {
    const fetchVisualizationRequest = async (): Promise<unknown> => {
      try {
        checkApiReady();
        const endpoint = `/api/Forecast/${energySource.toLowerCase()}/visualize?key=${jobKey}`;
        console.log(`🔍 Fetching visualization data from: ${endpoint}`);
        
        const response = await axiosInstance.get(endpoint);
        console.log(`✅ Visualization data for job ${jobKey}:`, response.data);
        
        return response.data;
      } catch (error) {
        return handleApiError(error, fetchVisualizationRequest);
      }
    };
    
    try {
      return await fetchVisualizationRequest();
    } catch (error) {
      console.error(`❌ Error fetching visualization data for job ${jobKey}:`, error);
      throw error;
    }
  }, [checkApiReady, handleApiError]);

  // Fetch orders for forecast list
  const fetchOrders = useCallback(async (): Promise<Order[]> => {
    const fetchOrdersRequest = async (): Promise<Order[]> => {
      try {
        checkApiReady();
        // This is using a mock API, but we still check authentication
        return getOrders();
      } catch (error) {
        return handleApiError(error, fetchOrdersRequest);
      }
    };
    
    try {
      return await fetchOrdersRequest();
    } catch (error) {
      console.error('❌ Failed to fetch orders after retry:', error);
      // Return empty array on error
      return [];
    }
  }, [checkApiReady, handleApiError]);

  // Return all API functions
  return {
    fetchUserJobs,
    fetchOrders,
    fetchVisualizationData
  };
};
