// solarForecastApi.ts
// Solar forecast specific API services

import axios from 'axios';
import { SolarForecastApiResponse } from './forecastTypes';
import axiosInstance from './axiosConfig';
import * as mockSolarApi from '../mockData/solarForecastMockApi';

// Log API configuration on initialization
if (import.meta.env.DEV) {
  console.debug(`[API Config] Using REAL Solar Forecast API with mock visualization data`);
}

/**
 * Response type for file upload
 */
export interface FileUploadResponse {
  jobid: string;
  message: string;
  status: number;
}

/**
 * Interface for standard forecast request parameters
 */
export interface StandardForecastParams {
  latitude: number;
  longitude: number;
  elevation: number;
  tilt: number;
  azimuth: number;
  tracking: number;
  capacity: number;
  // Add missing fields
  filename?: string;
  file_path?: string;
  guid?: string;
  aux?: string;
}

/**
 * Function to upload template file for forecast
 * @param file The template file to upload
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @param elevation Elevation value
 * @returns Promise with upload response
 */
export const uploadForecastTemplate = async (
  file: File,
  latitude: number,
  longitude: number,
  elevation: number
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('elevation', elevation.toString());

    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/basic_file",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ API Error in uploadForecastTemplate:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to submit standard forecast request with park specifications
 * @param params The parameters for the standard forecast
 * @returns Promise with forecast response
 */
export const submitStandardForecast = async (
  params: StandardForecastParams
): Promise<FileUploadResponse> => {
  try {
    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/basic",
      params
    );
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitStandardForecast:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to upload template file for annual forecast
 * @param file The template file to upload
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @param elevation Elevation value
 * @returns Promise with upload response
 */
export const uploadAnnualForecastTemplate = async (
  file: File,
  latitude: number,
  longitude: number,
  elevation: number
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('elevation', elevation.toString());

    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/premium_file",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ API Error in uploadAnnualForecastTemplate:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to submit standard annual forecast request with park specifications
 * @param params The parameters for the standard annual forecast
 * @returns Promise with forecast response
 */
export const submitStandardAnnualForecast = async (
  params: StandardForecastParams
): Promise<FileUploadResponse> => {
  try {
    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/premium",
      params
    );
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitStandardAnnualForecast:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to get solar forecast time series data
 * @returns Promise with solar forecast time series data
 */
export const getSolarForecastTimeSeries = async (): Promise<SolarForecastApiResponse> => {
  try {
    // Always make the real API call
    const response = await axiosInstance.get<SolarForecastApiResponse>("/api/Forecast/solar_time_series");
    
    // If the API call is successful, use mock data for visualization
    if (response.status === 200) {
      console.debug('[API] Real API call succeeded, using mock data for visualization');
      const mockData = await mockSolarApi.getSolarForecastTimeSeries();
      return mockData;
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error in getSolarForecastTimeSeries:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
      
      // If API call fails, fallback to mock data
      console.debug('[API] Real API call failed, falling back to mock data');
      return mockSolarApi.getSolarForecastTimeSeries();
    }
    throw error;
  }
};

/**
 * Function to get solar forecast prediction comparison data
 * @returns Promise with solar forecast prediction comparison data
 */
export const getSolarForecastPredictionComparison = async (): Promise<SolarForecastApiResponse> => {
  try {
    // Always make the real API call
    const response = await axiosInstance.get<SolarForecastApiResponse>("/api/Forecast/solar_prediction_comparison");
    
    // If the API call is successful, use mock data for visualization
    if (response.status === 200) {
      console.debug('[API] Real API call succeeded, using mock data for visualization');
      const mockData = await mockSolarApi.getSolarForecastPredictionComparison();
      return mockData;
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error in getSolarForecastPredictionComparison:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
      
      // If API call fails, fallback to mock data
      console.debug('[API] Real API call failed, falling back to mock data');
      return mockSolarApi.getSolarForecastPredictionComparison();
    }
    throw error;
  }
};

/**
 * Function to get solar forecast data for the about page
 * @returns Promise with solar forecast data
 */
export const getSolarForecastAbout = async (): Promise<SolarForecastApiResponse> => {
  try {
    // Always make the real API call
    const response = await axiosInstance.get<SolarForecastApiResponse>("/api/Forecast/solar/about");
    
    // If the API call is successful, use mock data for visualization
    if (response.status === 200) {
      console.debug('[API] Real API call succeeded, using mock data for visualization');
      const mockData = await mockSolarApi.getSolarForecastAbout();
      return mockData;
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error in getSolarForecastAbout:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
      
      // If API call fails, fallback to mock data
      console.debug('[API] Real API call failed, falling back to mock data');
      return mockSolarApi.getSolarForecastAbout();
    }
    throw error;
  }
};

/**
 * Interface for the JSON payload expected by the new /basic and /premium endpoints.
 */
export interface SolarJsonSubmitParams {
  latitude: number;
  longitude: number;
  elevation: number;
  filename: string; // The original filename
  file_path: string; // The validated file path received from /validatefile
  guid?: string; // Unique identifier for the request
  aux?: string; // Optional auxiliary information
  tilt: number; // Panel tilt angle in degrees
  azimuth: number; // Panel azimuth angle in degrees
  tracking: number; // Tracking type (0: fixed, 1: single-axis, 2: dual-axis)
  capacity: number; // Capacity in kW
  use_file?: boolean; // Whether to use the file for training (true) or not (false)
}

/**
 * Function to submit solar basic forecast request with JSON payload.
 * Uses the validated file_path instead of the raw file.
 * @param params The JSON parameters including latitude, longitude, elevation, and file_path.
 * @returns Promise with upload response (assuming FileUploadResponse is still correct).
 */
export const submitSolarBasicJson = async (
  params: SolarJsonSubmitParams,
  isTrainForm: boolean = false
): Promise<FileUploadResponse> => {
  try {
    // Use the original file path that was validated
    // Set use_file parameter based on form type
    const requestParams = {
      ...params,
      use_file: isTrainForm // true for TrainForecastForm, false for StandardForecastForm
    };
    
    console.log('🚀 Submitting Solar Basic JSON:', requestParams);
    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/basic", // Target the correct JSON endpoint
      requestParams, // Send params directly as JSON
      {
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
      }
    );
    console.log('✅ Solar Basic JSON submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitSolarBasicJson:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to submit solar premium forecast request with JSON payload.
 * Uses the validated file_path instead of the raw file.
 * @param params The JSON parameters including latitude, longitude, elevation, and file_path.
 * @returns Promise with upload response (assuming FileUploadResponse is still correct).
 */
export const submitSolarPremiumJson = async (
  params: SolarJsonSubmitParams,
  isTrainForm: boolean = false
): Promise<FileUploadResponse> => {
  try {
    // Use the original file path that was validated
    // Set use_file parameter based on form type
    const requestParams = {
      ...params,
      use_file: isTrainForm // true for TrainForecastForm, false for StandardForecastForm
    };
    
    console.log('🚀 Submitting Solar Premium JSON:', requestParams);
    const response = await axiosInstance.post<FileUploadResponse>(
      "/api/Forecast/solar/premium", // Target the correct JSON endpoint
      requestParams, // Send params directly as JSON
      {
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
      }
    );
    console.log('✅ Solar Premium JSON submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitSolarPremiumJson:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Expected response structure from successful solar file validation.
 * Make sure this is EXPORTED.
 */
export interface SolarValidationResponse { 
  valid?: boolean;
  message?: string;
  file_path?: string; // Path to the validated file on the server
  guid?: string; // Unique identifier generated by the server
  aux?: string; // Optional auxiliary information
  filename?: string; // Original filename
}

/**
  Function to validate a solar forecast template file.
 * @param file The template file to validate.
 * @returns Promise that resolves with the validation response data (incl. file_path) on success, throws on error.
 */
export const validateSolarForecastFile = async (
  file: File
): Promise<SolarValidationResponse> => { // <<< CORRECT return type
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Log the request details for debugging
    console.log(`🚀 Sending file validation request for: ${file.name}`);
    console.log(`  Size: ${file.size} bytes`);
    console.log(`  Type: ${file.type}`);
    console.log(`  Target URL: /api/Forecast/solar/validatefile`);

    // Capture the response
    const response = await axiosInstance.post<SolarValidationResponse>( // <<< Capture response and expect SolarValidationResponse
      "/api/Forecast/solar/validatefile", 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(`✅ File validation successful for: ${file.name}`, response.data);
    // Return the response data on success
    return response.data; // <<< CORRECTLY return data

  } catch (error) {
    console.error('❌ API Error in validateSolarForecastFile:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Validation Response data:', error.response?.data);
      console.error('❌ Validation Response status:', error.response?.status);
      console.error('❌ Validation Response headers:', error.response?.headers);
      // Re-throw a more specific error message if possible
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || 'Unknown validation error';
      throw new Error(`File validation failed: ${errorMessage}`);
    } else {
      // Handle non-Axios errors
       throw new Error(`File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
