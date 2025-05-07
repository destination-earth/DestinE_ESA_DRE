import { useMutation, useQuery } from "@tanstack/react-query";
import {
  initializeAssessment,
  getSolarAbout,
  getWindAbout,
  submitBasicSolarAssessment,
  submitBasicWindAssessment,
  submitPremiumSolarAssessment,
  submitPremiumWindAssessment,
  getWindBasic,
  AssessmentApiResponse,
  BasicSolarAssessmentRequest,
  BasicWindAssessmentRequest,
  PremiumSolarAssessmentRequest,
  PremiumWindAssessmentRequest,
  WindAssessmentApiResponse
} from "../../services/api/assessmentApi";
import { useAuth } from "../useAuth";
import { useContext } from "react";
import { AuthContext } from "../../services/providers/AuthProvider";
import axiosInstance from "../../services/api/axiosConfig";
import { formatDateToDisplay, parseDisplayDateToISO } from "../../utils/dateFormatUtils";
import { AxiosError } from "axios";

// Define types for user jobs
interface Job {
  jobKey: string;
  datetime: string;
  datetimeStr: string;
  energySource: string;
  plan: string;
  progress: string;
  parameters: string;
  downloadUrl: string;
}

interface JobsResponse {
  jobs: Job[];
}

/**
 * Hook for fetching user jobs with authentication handling
 */
export const useUserJobsQuery = () => {
  const { isAuthenticated, apiInitialized } = useAuth();
  const auth = useContext(AuthContext);
  
  return useQuery<JobsResponse, Error>({
    queryKey: ["userJobs"],
    queryFn: async () => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with user jobs request");
        }
      }
      
      try {
        const response = await axiosInstance.get<JobsResponse>("/api/Jobs/userJobs");
        
        // Process and normalize dates in the response
        if (response.data?.jobs?.length > 0) {
          response.data.jobs = response.data.jobs.map(job => {
            try {
              // Ensure we have valid date strings
              if (job.datetime) {
                // If datetime is in ISO format, format it for display
                if (job.datetime.includes('-') || job.datetime.includes('T')) {
                  // For ISO datetime with time part, extract just the date
                  if (job.datetime.includes('T')) {
                    const isoDate = job.datetime.split('T')[0];
                    job.datetimeStr = formatDateToDisplay(isoDate);
                  } else {
                    job.datetimeStr = formatDateToDisplay(job.datetime);
                  }
                }
              } else if (job.datetimeStr) {
                // If only datetimeStr is available, check its format
                if (job.datetimeStr.includes('/')) {
                  // Already in DD/MM/YYYY format, just ensure datetime is set
                  if (!job.datetime) {
                    job.datetime = parseDisplayDateToISO(job.datetimeStr);
                  }
                } else if (job.datetimeStr.includes('-')) {
                  // If in ISO format, ensure it's properly formatted for display
                  job.datetime = job.datetimeStr;
                  job.datetimeStr = formatDateToDisplay(job.datetimeStr);
                }
              }
              
              // Final check to ensure both fields are populated
              if (job.datetime && !job.datetimeStr) {
                job.datetimeStr = formatDateToDisplay(job.datetime);
              } else if (job.datetimeStr && !job.datetime) {
                // Only convert if it's in DD/MM/YYYY format
                if (job.datetimeStr.includes('/')) {
                  job.datetime = parseDisplayDateToISO(job.datetimeStr);
                }
              }
            } catch (e) {
              console.error(`Error processing date for job ${job.jobKey}:`, e);
            }
            return job;
          });
        }
        
        return response.data;
      } catch (error) {
        console.error("API Error in getUserJobs:", error);
        if ((error as AxiosError).response) {
          console.error("Response status:", (error as AxiosError).response?.status);
        } else {
          console.error("No response received, likely a network error");
        }
        throw error;
      }
    },
    enabled: isAuthenticated && apiInitialized,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook for initializing assessment
 */
export const useInitializeAssessment = () => {
  const { isAuthenticated, apiInitialized } = useAuth();
  const auth = useContext(AuthContext);
  
  return useQuery<AssessmentApiResponse, Error>({
    queryKey: ["assessment", "initialize"],
    queryFn: async () => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with assessment initialization");
        }
      }
      
      return initializeAssessment();
    },
    enabled: isAuthenticated && apiInitialized,
  });
};

/**
 * Hook for getting solar about information
 */
export const useSolarAbout = () => {
  const { isAuthenticated, apiInitialized } = useAuth();
  const auth = useContext(AuthContext);
  
  return useQuery<AssessmentApiResponse, Error>({
    queryKey: ["assessment", "solar", "about"],
    queryFn: async () => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with solar about request");
        }
      }
      
      return getSolarAbout();
    },
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting wind about information
 */
export const useWindAbout = () => {
  const { isAuthenticated, apiInitialized } = useAuth();
  const auth = useContext(AuthContext);
  
  return useQuery<AssessmentApiResponse, Error>({
    queryKey: ["assessment", "wind", "about"],
    queryFn: async () => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with wind about request");
        }
      }
      
      return getWindAbout();
    },
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting basic wind assessment data
 */
export const useWindBasicQuery = (
  startDate: string,
  endDate: string,
  latitude: number,
  longitude: number,
  height: number,
  enabled: boolean
) => {
  const { isAuthenticated, apiInitialized } = useAuth();
  const auth = useContext(AuthContext);
  
  return useQuery<WindAssessmentApiResponse, Error>({
    queryKey: ["assessment", "wind", "basic", startDate, endDate, latitude, longitude, height],
    queryFn: async () => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with wind basic request");
        }
      }
      
      return getWindBasic(startDate, endDate, latitude, longitude, height);
    },
    enabled: (isAuthenticated && apiInitialized) || enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for submitting a basic solar assessment
 */
export const useBasicSolarAssessmentMutation = () => {
  const auth = useContext(AuthContext);
  
  return useMutation<
    AssessmentApiResponse,
    Error,
    BasicSolarAssessmentRequest
  >({
    mutationFn: async (request) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with basic solar assessment submission");
        }
      }
      
      return submitBasicSolarAssessment(request);
    },
  });
};

/**
 * Hook for submitting a basic wind assessment
 */
export const useBasicWindAssessmentMutation = () => {
  const auth = useContext(AuthContext);
  
  return useMutation<
    AssessmentApiResponse,
    Error,
    BasicWindAssessmentRequest
  >({
    mutationFn: async (request) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with basic wind assessment submission");
        }
      }
      
      return submitBasicWindAssessment(request);
    },
  });
};

/**
 * Hook for submitting a premium solar assessment
 */
export const usePremiumSolarAssessmentMutation = () => {
  const auth = useContext(AuthContext);
  
  return useMutation<
    AssessmentApiResponse,
    Error,
    PremiumSolarAssessmentRequest
  >({
    mutationFn: async (request) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with premium solar assessment submission");
        }
      }
      
      return submitPremiumSolarAssessment(request);
    },
  });
};

/**
 * Hook for submitting a premium wind assessment
 */
export const usePremiumWindAssessmentMutation = () => {
  const auth = useContext(AuthContext);
  
  return useMutation<
    AssessmentApiResponse,
    Error,
    PremiumWindAssessmentRequest
  >({
    mutationFn: async (request) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with premium wind assessment submission");
        }
      }
      
      return submitPremiumWindAssessment(request);
    },
  });
};
