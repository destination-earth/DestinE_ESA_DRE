// overviewAssessmentsApi.ts
// API services for overview assessments

import axiosInstance from './axiosConfig';
import axios from 'axios';

/**
 * Interface for Job data
 */
export interface Job {
  jobKey: string;
  datetime: string;
  datetimeStr: string;
  energySource: string;
  plan: string;
  progress: string;
  parameters: string;
  downloadUrl: string;
}

/**
 * Interface for Jobs response
 */
export interface JobsResponse {
  jobs: Job[];
}

/**
 * Function to fetch user jobs from the API
 * @returns Promise with jobs response
 */
export const getUserJobs = async (): Promise<JobsResponse> => {
  try {
    const response = await axiosInstance.get<JobsResponse>('/api/Jobs/userJobs');
    return response.data;
  } catch (error: unknown) {
    console.error('❌ API Error in getUserJobs:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    
    // Return empty jobs array as fallback
    return { jobs: [] };
  }
};

/**
 * Function to fetch job details by job key
 * @param jobKey The unique identifier for the job
 * @returns Promise with job details
 */
export const getJobDetails = async (jobKey: string): Promise<Job> => {
  try {
    const response = await axiosInstance.get<Job>(`/api/Jobs/${jobKey}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`❌ API Error in getJobDetails for job ${jobKey}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to delete a job
 * @param jobKey The unique identifier for the job to delete
 * @returns Promise with delete operation result
 */
export const deleteJob = async (jobKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    await axiosInstance.delete(`/api/Jobs/${jobKey}`);
    return { 
      success: true, 
      message: 'Job deleted successfully' 
    };
  } catch (error: unknown) {
    console.error(`❌ API Error in deleteJob for job ${jobKey}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    return { 
      success: false, 
      message: axios.isAxiosError(error) 
        ? `Error: ${error.response?.status} - ${error.response?.statusText}` 
        : 'Unknown error occurred' 
    };
  }
};