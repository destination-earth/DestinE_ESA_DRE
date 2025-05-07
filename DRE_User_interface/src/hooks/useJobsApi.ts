// useJobsApi.ts
// Custom hook for making API calls to fetch jobs data

import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { setAuthToken } from '../services/api/axiosConfig';
import axiosInstance from '../services/api/axiosConfig';

// Types
export interface Job {
  jobKey: string;
  datetime: string;
  datetimeStr: string;
  energySource: string;
  plan: string;
  progress: string;
  parameters: string;
  source?: 'solar' | 'wind';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  downloadUrl?: string;
  downloadUrls?: string[];
  requestType?: 'assessment' | 'forecast';
}

export interface JobsResponse {
  jobs: Job[];
}

export interface JobsFilter {
  type?: 'assessment' | 'forecast';
  source?: 'solar' | 'wind';
  plan?: 'basic' | 'premium' | 'trial';
}

/**
 * Custom hook for fetching jobs data from the API
 */
export const useJobsApi = () => {
  const { accessToken, apiInitialized } = useAuth();
  
  // Set auth token when it changes
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
    }
  }, [accessToken]);
  
  // Helper function to build query string from filters
  const buildQueryString = useCallback((filters?: JobsFilter): string => {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.source) params.append('source', filters.source);
    if (filters.plan) params.append('plan', filters.plan);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, []);
  
  // Fetch user jobs with optional filtering
  const fetchUserJobs = useCallback(async (filters?: JobsFilter): Promise<{ jobs: Job[]; type?: 'assessment' | 'forecast' }> => {
    try {
      // Check if we can make API calls
      if (!accessToken || !apiInitialized) {
        console.warn('API not ready yet, returning empty response');
        return { jobs: [] };
      }
      
      const queryString = buildQueryString(filters);
      const url = `/api/Jobs/userJobs${queryString}`;
      
      console.log(`🔍 Fetching jobs with filters:`, filters || 'none');
      const response = await axiosInstance.get<JobsResponse>(url);
      
      // Log the raw API response
      console.log('🔄 Raw API Response:', JSON.stringify(response.data, null, 2));
      console.log('✅ API Response:', response.data);
      
      // Process the jobs to ensure they have the correct properties
      if (response.data?.jobs?.length > 0) {
        const processedJobs = response.data.jobs.map(job => {
          // First, fix any date issues
          const processedJob: Job = { ...job };
          // Add the type used in the request, if present
          if (filters?.type) {
            (processedJob as any).requestType = filters.type;
          }
          
          try {
            // Check if datetime is valid
            const date = new Date(job.datetime);
            if (isNaN(date.getTime()) && job.datetimeStr) {
              processedJob.datetime = job.datetimeStr;
            } else if (!job.datetimeStr && !isNaN(date.getTime())) {
              processedJob.datetimeStr = job.datetime;
            }
            
            // Normalize plan and status values to lowercase
            if (processedJob.plan) {
              processedJob.plan = processedJob.plan.toLowerCase();
            }
            
            if (processedJob.status) {
              // Convert to lowercase and ensure it's a valid status type
              const normalizedStatus = processedJob.status.toLowerCase();
              
              // Only assign if it's one of the valid status types
              if (['pending', 'running', 'completed', 'failed'].includes(normalizedStatus)) {
                processedJob.status = normalizedStatus as 'pending' | 'running' | 'completed' | 'failed';
              }
            }
          } catch (e) {
            console.error(`Error processing date for job ${job.jobKey}:`, e);
          }
          
          // console.log(`Processed job ${processedJob.jobKey}`);
          return processedJob;
        });
        
        return { jobs: processedJobs, type: filters?.type };
      }
      
      return { jobs: [] };
    } catch (error) {
      console.error('❌ Failed to fetch jobs:', error);
      return { jobs: [] };
    }
  }, [accessToken, apiInitialized, buildQueryString]);
  
  return {
    fetchUserJobs,
  };
};
