// useForecastQueries.ts
// Custom hooks for using TanStack Query with forecast APIs

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseMutationOptions 
} from '@tanstack/react-query';
import {
  validateWindTrainingFiles,
  ValidateWindFilesParams,
  FileValidationResult
} from "../services/api/windForecastApi";
import { useForecastApi } from './useForecastApi';
import { useAuth } from './useAuth';
import { 
  SolarForecastApiResponse, 
  WindForecastApiResponse 
} from '../services/api/forecastTypes';
import {
  submitSolarBasicJson, 
  submitSolarPremiumJson, 
  SolarJsonSubmitParams, 
  SolarValidationResponse, 
  FileUploadResponse, 
  validateSolarForecastFile,
  // Removed unused imports:
  // submitStandardForecast,
  // submitStandardAnnualForecast,
} from '../services/api/solarForecastApi';
import {
  submitWindBasicJson,
  submitWindPremiumJson,
  WindJsonSubmitParams,
  submitStandardForecast as submitWindStandardForecast,
  submitStandardAnnualForecast as submitWindStandardAnnualForecast,
} from '../services/api/windForecastApi';
import { addOrder } from '../services/mockData/ordersMockApi';
import axiosInstance from '../services/api/axiosConfig';
import { useContext } from 'react';
import { AuthContext } from '../services/providers/AuthProvider';

/**
 * Hook for fetching solar forecast time series data
 */
export const useSolarForecastTimeSeriesQuery = () => {
  const { fetchSolarForecastTimeSeries } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<SolarForecastApiResponse, Error>({
    queryKey: ['solarForecastTimeSeries'],
    queryFn: fetchSolarForecastTimeSeries,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Hook for fetching solar forecast prediction comparison data
 */
export const useSolarForecastPredictionComparisonQuery = () => {
  const { fetchSolarForecastPredictionComparison } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<SolarForecastApiResponse, Error>({
    queryKey: ['solarForecastPredictionComparison'],
    queryFn: fetchSolarForecastPredictionComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Hook for fetching solar forecast about page data
 */
export const useSolarForecastAboutQuery = () => {
  const { fetchSolarForecastAbout } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<SolarForecastApiResponse, Error>({
    queryKey: ['solarForecastAbout'],
    queryFn: fetchSolarForecastAbout,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Hook for fetching wind forecast time series data
 */
export const useWindForecastTimeSeriesQuery = () => {
  const { fetchWindForecastTimeSeries } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<WindForecastApiResponse, Error>({
    queryKey: ['windForecastTimeSeries'],
    queryFn: fetchWindForecastTimeSeries,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Hook for fetching wind forecast prediction comparison data
 */
export const useWindForecastPredictionComparisonQuery = () => {
  const { fetchWindForecastPredictionComparison } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<WindForecastApiResponse, Error>({
    queryKey: ['windForecastPredictionComparison'],
    queryFn: fetchWindForecastPredictionComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Hook for fetching wind forecast about page data
 */
export const useWindForecastAboutQuery = () => {
  const { fetchWindForecastAbout } = useForecastApi();
  const { isAuthenticated, apiInitialized } = useAuth();
  
  return useQuery<WindForecastApiResponse, Error>({
    queryKey: ['windForecastAbout'],
    queryFn: fetchWindForecastAbout,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && apiInitialized,
    retry: 1,
  });
};

/**
 * Interface for template upload parameters
 */
export interface ForecastTemplateMutationParams {
  type: 'solar' | 'wind';
  submissionType: 'basic' | 'premium';
  latitude: number;
  longitude: number;
  elevation?: number; // For solar
  validatedFilename?: string; // For solar
  capacity?: number; // For wind
  hubHeight?: number; // For wind
  powerCurveModel?: string; // For wind
  validatedTemplateFilename?: string; // For wind
  validatedPowerCurveFilename?: string | null; // For wind
  validatedCombinedPath?: string | null; // For wind
  guid?: string; // Unique identifier from validation response
  aux?: string; // Optional auxiliary information from validation response
}

/**
 * Interface for standard solar forecast parameters
 */
export interface StandardSolarForecastParams {
  latitude: number;
  longitude: number;
  elevation: number;
  azimuth: number;
  tilt: number;
  tracking: number;
  capacity: number;
}

/**
 * Interface for standard wind forecast parameters
 */
export interface StandardWindForecastParams {
  latitude: number;
  longitude: number;
  elevation: number;
  hubHeight: number;
  powerCurveModel: string;
  startDate: string;
  endDate: string;
  capacity: number;
  guid?: string;
  aux?: string;
}

/**
 * Hook for uploading forecast templates and creating orders
 */
export const useForecastTemplateMutation = (
  options?: UseMutationOptions<
    FileUploadResponse,
    Error,
    ForecastTemplateMutationParams,
    unknown // Context type
  >
) => {
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  
  // Create the mutation for uploading templates
  const uploadMutation = useMutation<
    FileUploadResponse,
    Error,
    ForecastTemplateMutationParams,
    unknown
  >({
    mutationFn: async ({ type, submissionType, latitude, longitude, elevation, validatedFilename, capacity, hubHeight, powerCurveModel, validatedTemplateFilename, validatedPowerCurveFilename, validatedCombinedPath, guid: paramGuid, aux: paramAux }: ForecastTemplateMutationParams) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with template upload");
        }
      }
      
      // Check if authorization header is set
      const authHeader = axiosInstance.defaults.headers.common['Authorization'];
      if (!authHeader) {
        console.warn("⚠️ No Authorization header for template upload request");
        // We'll continue anyway since the interceptor might handle it
      } else {
        console.log("🔒 Making authenticated template upload with token");
      }
      
      // Log the actual request parameters
      console.log(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${submissionType} forecast submission:`,
        {
          endpoint:
            type === "solar"
              ? submissionType === "premium"
                ? "submitSolarPremiumJson"
                : "submitSolarBasicJson"
              : submissionType === "premium"
                ? "submitWindPremiumJson"
                : "submitWindBasicJson",
          parameters: JSON.stringify(
            { 
              latitude, 
              longitude, 
              elevation, 
              capacity, 
              hubHeight, 
              powerCurveModel, 
              validatedFilename, 
              validatedTemplateFilename, 
              validatedPowerCurveFilename, 
              validatedCombinedPath 
            },
            null,
            2,
          ),
          url:
            type === "solar"
              ? submissionType === "premium"
                ? "/api/Forecast/solar/premium"
                : "/api/Forecast/solar/basic"
              : submissionType === "premium"
                ? "/api/Forecast/wind/premium"
                : "/api/Forecast/wind/basic",
          baseUrl: import.meta.env.VITE_BASE_URL,
        },
      );

      // Use different API endpoints based on the energy type and source tab
      if (type === "solar") {
        // Ensure validatedFilename is provided for solar
        if (!validatedFilename) {
          throw new Error('Validated filename is required for solar forecast template submission.');
        }
        // Extract original filename from the validatedFilename
        let solarFilePath = '';
        let originalFilename = '';
        
        // Log the GUID and aux passed from the component
        console.log('GUID passed from component:', paramGuid);
        console.log('Aux passed from component:', paramAux);
        
        if (validatedFilename) {
          // Extract file path
          solarFilePath = validatedFilename;
          
          // Extract original filename from the path
          const parts = validatedFilename.split(/[/\\]/); // Fixed unnecessary escape character
          originalFilename = parts[parts.length - 1];
          
          // Update file_path to be just the first part if it's a compound string
          const pathParts = validatedFilename.split('|');
          if (pathParts.length > 1) {
            solarFilePath = pathParts[0];
          }
        }
        
        // Log the GUID passed from the component
        console.log('GUID passed from component to API request:', paramGuid);
        
        const solarParams: SolarJsonSubmitParams = {
          latitude,
          longitude,
          elevation: elevation ?? 0, // Default elevation to 0 if undefined
          file_path: solarFilePath, // The full server path
          filename: originalFilename, // Just the filename
          guid: paramGuid || '', // Use the GUID passed from the component
          aux: paramAux || '', // Use the aux passed from the component
          // Default values for required fields
          tilt: 0,  // These should be updated with actual values if available
          azimuth: 0,
          tracking: 0,
          capacity: 0
        };
        // For solar train forecasts, pass isTrainForm=true
        if (submissionType === 'basic') {
          console.log('🚀 Calling submitSolarBasicJson with isTrainForm=true:', solarParams);
          return submitSolarBasicJson(solarParams, true); // Set isTrainForm=true for TrainForecastForm
        } else { // submissionType === 'premium'
          console.log('🚀 Calling submitSolarPremiumJson with isTrainForm=true:', solarParams);
          return submitSolarPremiumJson(solarParams, true); // Set isTrainForm=true for TrainForecastForm
        }
      } else { // type === 'wind'
        // Ensure required wind parameters are provided
        if (!validatedTemplateFilename) { 
          // Let's rethink - we only need the COMBINED path now based on backend request.
          // throw new Error('Validated template filename is required for wind submission.');
        }
        if (!validatedCombinedPath) { // Check for the combined path string
          throw new Error('Validated combined file path is required for wind submission.');
        }
        if (capacity === undefined || capacity === null) {
          throw new Error('Capacity is required for wind submission.');
        }
        if (hubHeight === undefined || hubHeight === null) {
          throw new Error('Hub height is required for wind submission.');
        }
        // Add check for the variable holding the train data path (assuming it's validatedPowerCurveFilename)
        // Remove this check as train_data might be optional or derived differently now
        // if (!validatedPowerCurveFilename) {
        //   throw new Error('Validated train data filename is required for wind submission.');
        // }

        // Extract original filename from the full path
        const getOriginalFilename = (path: string) => {
          if (!path) return '';
          // Extract just the filename from the full path
          const parts = path.split(/[\\/]/);
          return parts[parts.length - 1];
        };
        
        // Use the guid and aux properties directly if provided, otherwise try to extract from path
        let guid = '';
        let aux = '';
        
        // First check if guid and aux were provided directly as properties
        if (paramGuid) {
          guid = paramGuid;
          console.log('Using provided GUID:', guid);
        } else if (validatedCombinedPath) {
          // Fall back to extracting from path if not provided directly
          const pathParts = validatedCombinedPath.split('|');
          if (pathParts.length >= 2) {
            guid = pathParts[1] || '';
            console.log('Extracted GUID from path:', guid);
          }
        }
        
        if (paramAux) {
          aux = paramAux;
          console.log('Using provided aux:', aux);
        } else if (validatedCombinedPath) {
          // Fall back to extracting from path if not provided directly
          const pathParts = validatedCombinedPath.split('|');
          if (pathParts.length >= 3) {
            aux = pathParts[2] || '';
            console.log('Extracted aux from path:', aux);
          }
        }

        // Construct the JSON payload for wind submission
        const windParams: WindJsonSubmitParams = {
          latitude,
          longitude,
          hubheight: hubHeight, // Hub height in meters
          // Use just the original filename, not the full path
          filename: getOriginalFilename(validatedTemplateFilename || ''),
          // Use the full server path from validation for train_data
          train_data: validatedCombinedPath ? validatedCombinedPath.split('|')[0] || '' : '',
          // Include guid from validation response
          guid: guid,
          // Include aux from validation response
          aux: aux,
          powerCurveModel: powerCurveModel ?? "",
          capacity: capacity // Already number from interface
        };
        
        console.log('📝 Constructed wind params with correct field mapping:', windParams);

        // Add check for train_data path if it's truly required by backend
        if (!windParams.train_data) {
            // Decide if this is an error or if train_data is optional
            // console.warn('train_data path is missing in wind submission payload.');
            // For now, let's assume it might be optional or derived from the combined 'filename'
            // If it IS required, uncomment the error throw:
            // throw new Error('Validated train data filename is required for wind submission (from combined path).');
        }

        if (submissionType === 'basic') {
          console.log('🚀 Calling submitWindBasicJson with:', windParams);
          return await submitWindBasicJson(windParams);
        } else { // submissionType === 'premium'
          console.log('🚀 Calling submitWindPremiumJson with:', windParams);
          return await submitWindPremiumJson(windParams);
        }
      }
    },
    onSuccess: (data, variables, context) => {
      console.log('✅ Forecast Template submission successful:', data);
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });

      // Call original onSuccess first (if provided)
      options?.onSuccess?.(data, variables, context);
      
      // Create the order using data from the response and variables
      try {
        // Access type and submissionType from variables
        const { type, submissionType } = variables;
        console.log(`Creating ${type} order for ${submissionType}`);
        // Pass the correct arguments to addOrder
        const newOrder = addOrder(
          type, // Corresponds to energyType
          submissionType === "premium" ? "Annual" : "One-off" // Map submissionType to plan
        );
        console.log("Order created successfully:", newOrder);

        // Invalidate orders query cache after successful order creation
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        console.log("Invalidated orders query cache");

      } catch (error) {
        console.error("Error creating order after successful submission:", error);
        // Decide how to handle order creation failure - maybe notify user?
      }
    },
    onError: (error, variables, context) => {
      console.error("❌ Forecast Template submission failed:", error);
      // Call original onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options, // Spread any additional options like onSettled
  });

  return {
    uploadMutation,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    uploadSuccess: uploadMutation.isSuccess,
    uploadTemplate: uploadMutation.mutate,
    uploadTemplateAsync: uploadMutation.mutateAsync,
  };
};

/**
 * Hook for submitting standard forecasts and creating orders
 */
export const useStandardForecastMutation = (
  energyType: 'solar' | 'wind',
  sourceTab: 'oneoff' | 'annual' = 'oneoff',
  onSuccess?: (orderId: string, energyType: 'solar' | 'wind') => void
) => {
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  
  // Create the mutation for standard forecasts
  const standardForecastMutation = useMutation<
    FileUploadResponse,
    Error,
    StandardSolarForecastParams | StandardWindForecastParams
  >({
    mutationFn: async (params: StandardSolarForecastParams | StandardWindForecastParams) => {
      // Wait for authentication to be initialized
      if (auth) {
        const authReady = await auth.waitForAuth();
        if (!authReady) {
          console.warn("⚠️ Authentication not ready after waiting, proceeding anyway");
        } else {
          console.log("✅ Authentication ready, proceeding with standard forecast");
        }
      }
      
      // Check if authorization header is set
      const authHeader = axiosInstance.defaults.headers.common['Authorization'];
      if (!authHeader) {
        console.warn("⚠️ No Authorization header for standard forecast request");
        // We'll continue anyway since the interceptor might handle it
      } else {
        console.log("🔒 Making authenticated standard forecast with token");
      }
      
      // Log the actual request parameters
      console.log(
        `${energyType.charAt(0).toUpperCase() + energyType.slice(1)} ${sourceTab} standard forecast request:`,
        {
          endpoint:
            energyType === "solar"
              ? sourceTab === "annual"
                ? "submitStandardAnnualForecast"
                : "submitStandardForecast"
              : sourceTab === "annual"
                ? "submitWindStandardAnnualForecast"
                : "submitWindStandardForecast",
          parameters: JSON.stringify(params, null, 2),
          url:
            energyType === "solar"
              ? sourceTab === "annual"
                ? "/api/Forecast/solar/premium"
                : "/api/Forecast/solar/basic"
              : sourceTab === "annual"
                ? "/api/Forecast/wind/premium"
                : "/api/Forecast/wind/basic",
          baseUrl: import.meta.env.VITE_BASE_URL,
        },
      );

      // Use different API endpoints based on the energy type and source tab
      if (energyType === "solar") {
        // Add missing fields with empty strings for solar standard forecasts
        const solarParams = {
          ...params as StandardSolarForecastParams,
          filename: "",
          file_path: "",
          guid: "",
          aux: ""
        };
        
        console.log('Enhanced solar standard forecast params:', solarParams);
        
        // For solar forecasts, pass isTrainForm=false for StandardForecastForm
        return sourceTab === "annual"
          ? submitSolarPremiumJson(solarParams, false) // Use JSON API with isTrainForm=false
          : submitSolarBasicJson(solarParams, false);  // Use JSON API with isTrainForm=false
      } else {
        // For wind forecasts, we need to include all parameters including capacity and validation data
        const windParams = params as StandardWindForecastParams;
        
        // Create complete API params with the same structure as TrainForecastForm
        // This ensures consistency between both forms
        const apiParams = {
          latitude: windParams.latitude,
          longitude: windParams.longitude,
          hubheight: windParams.hubHeight, // Use lowercase hubheight to match backend expectations
          powerCurveModel: windParams.powerCurveModel,
          capacity: windParams.capacity,
          // Include these fields for consistency with TrainForecastForm
          filename: "", // Empty string when no file is uploaded
          train_data: "", // Empty string when no training data
          guid: windParams.guid || "", // Use guid from validation if available, otherwise empty string
          aux: windParams.aux || "", // Use aux from validation if available, otherwise empty string
          // Include startDate and endDate for standard forecasts
          // startDate: windParams.startDate,
          // endDate: windParams.endDate
        };

        // Log capacity for debugging
        console.log(`Using wind capacity: ${windParams.capacity} MW`);
        
        // Calculate expected power output based on capacity
        const expectedPowerOutput = windParams.capacity * 0.35; // Assuming 35% capacity factor
        console.log(
          `Expected average power output: ${Number(expectedPowerOutput).toFixed(2)} MW`,
        );
        
        // Log the complete request structure
        console.log('Wind standard forecast request with complete structure:', apiParams);

        return sourceTab === "annual"
          ? submitWindStandardAnnualForecast(apiParams)
          : submitWindStandardForecast(apiParams);
      }
    },
    onSuccess: (data) => {
      console.log("Standard forecast submitted successfully:", data);

      // Create Order upon successful submission
      try {
        const plan = sourceTab === 'annual' ? 'Annual' : 'One-off';
        console.log(`Creating ${energyType} order for ${plan}`);
        // Pass correct arguments to addOrder
        const newOrder = addOrder(energyType, plan);
        console.log("Order created successfully:", newOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Call the onSuccess callback provided to the hook if it exists and order was created
        if (onSuccess && newOrder) {
          onSuccess(newOrder.id, energyType);
        }
      } catch (error) {
        console.error("Error creating order:", error);
      }
    },
    onError: (error) => {
      console.error("Standard forecast submission error:", error);
    },
  });

  return {
    standardForecastMutation,
    isSubmitting: standardForecastMutation.isPending,
    submitError: standardForecastMutation.error,
    submitSuccess: standardForecastMutation.isSuccess,
    submitForecast: standardForecastMutation.mutate,
    submitForecastAsync: standardForecastMutation.mutateAsync,
  };
};

/**
 * Hook for validating a wind forecast template file.
 */
export const useValidateWindFilesMutation = <
  TData = FileValidationResult,
  TError = Error,
  TVariables = ValidateWindFilesParams,
  TContext = unknown
>(
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    // Type assertion needed as mutationFn expects specific types
    mutationFn: (variables) => validateWindTrainingFiles(variables as ValidateWindFilesParams) as Promise<TData>,
    onSuccess: (data, variables, context) => {
      // Basic success/warning logging. Detailed handling is in the component.
      console.log("✅ useValidateWindFilesMutation: Validation successful.", data);
      // Optionally invalidate queries if needed
      queryClient.invalidateQueries({ queryKey: ['windValidationStatus'] });
      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Generic error logging. Specific error display is in the component.
      console.error("❌ useValidateWindFilesMutation: Validation failed:", error);
      // Call the original onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options, // Spread any additional options
  });

  // Return values similar to the solar hook for consistency
  return {
    validateWindFiles: mutation.mutate,
    validateWindFilesAsync: mutation.mutateAsync, // Often useful
    isWindValidationLoading: mutation.isPending,
    windValidationError: mutation.error,
    isWindValidationSuccess: mutation.isSuccess,
    windValidationData: mutation.data,
    resetWindValidation: mutation.reset,
  };
};

/**
 * Hook for validating a solar forecast template file.
 */
export const useValidateSolarFileMutation = <
  TData = SolarValidationResponse,
  TError = Error,
  TVariables = File,
  TContext = unknown
>(
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    TData,
    TError,
    TVariables,
    TContext
  >({
    mutationFn: async (file: TVariables): Promise<TData> => {
      // Ensure the variable is treated as a File if TVariables is File
      if (!(file instanceof File)) {
         throw new Error("Input must be a File object.");
      }
      // Explicitly cast the result if necessary, assuming validateSolarForecastFile returns SolarValidationResponse
      const result = await validateSolarForecastFile(file as File);
      // Ensure the return type matches TData. If TData is SolarValidationResponse, this cast is safe.
      // If TData is different, this might need adjustment or validation.
      return result as TData;
    },
    onSuccess: (data, variables, context) => {
      console.log("✅ useValidateSolarFileMutation: Validation successful.", data);
      queryClient.invalidateQueries({ queryKey: ['solarValidationStatus'] });
      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("❌ useValidateSolarFileMutation: Validation failed:", error);
      // Call the original onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options, // Spread any additional options like onSettled
  });

  return {
    validateFile: mutation.mutate,
    isValidationLoading: mutation.isPending,
    validationError: mutation.error,
    isValidationSuccess: mutation.isSuccess,
    validationData: mutation.data,
    resetSolarValidation: mutation.reset,
  };
};