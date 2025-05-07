// windAssessmentApi.ts
// Wind assessment specific API services

import axios from "axios";
import axiosInstance from './axiosConfig';
import {
  WindAssessmentApiResponse,
  BasicWindAssessmentRequest,
  PremiumWindAssessmentRequest,
} from './assessmentTypes';

/**
 * Interface for wind file validation response
 */
export interface WindFileValidationResponse {
  status: string;
  message: string;
  file_path?: string;
  guid?: string;
  aux?: string;
}

/**
 * Function to get wind about information
 * @returns Promise with assessment response
 */
export const getWindAbout = async (): Promise<WindAssessmentApiResponse> => {
  // Assuming the 'about' endpoint returns a similar structure, adjust if needed
  const response = await axiosInstance.get<WindAssessmentApiResponse>("/api/Assessment/wind/about");
  return response.data;
};

/**
 * Function to get basic wind assessment data
 * @param startDate Start date in ISO format
 * @param endDate End date in ISO format
 * @param latitude Latitude as number
 * @param longitude Longitude as number
 * @param height Height as number
 * @returns Promise with wind assessment API response
 */
export const getWindBasic = async (
  startDate: string,
  endDate: string,
  latitude: number,
  longitude: number,
  height: number
): Promise<WindAssessmentApiResponse> => {
  try {
    const response = await axiosInstance.post<WindAssessmentApiResponse>("/api/Assessment/wind/basic", {
      startDate,
      endDate,
      latitude,
      longitude,
      height
    });
    
    // Log the API response data for debugging
    console.log('🔍 API Response from /api/Assessment/wind/basic:', {
      windSpeed: response.data.windSpeed?.length || 'No wind speed data',
      count_wind_speed: response.data.count_wind_speed?.length || 'No wind speed distribution data',
      directiona_stat_output: response.data.directiona_stat_output?.length || 'No directional stats data',
      rose_diagram: response.data.rose_diagram ? 'Rose diagram data present' : 'No rose diagram data',
      csv_link: response.data.csv_link ? 'CSV links present' : 'No CSV links',
      output_power: response.data.output_power?.length || 'No output power data',
      fullResponse: response.data // Log the full response object
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching wind basic data:", error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
    }
    throw error;
  }
};

/**
 * Function to submit a basic wind assessment
 * @param data Basic wind assessment request data
 * @returns Promise with assessment response
 */
export const submitBasicWindAssessment = async (
  data: BasicWindAssessmentRequest
): Promise<WindAssessmentApiResponse> => {
  // Convert string values to numbers for API
  const formattedData = {
    ...data,
    latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude as string) : data.latitude,
    longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude as string) : data.longitude,
    height: typeof data.height === 'string' ? parseFloat(data.height as string) : data.height,
    // Ensure dates are in ISO format
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    // Include file_path, guid, and aux if they exist
    file_path: data.file_path || '',
    guid: data.guid || '',
    aux: data.aux || ''
  };
  
  console.log('🚀 Submitting Wind Basic Assessment:', formattedData);
  
  try {
    const response = await axiosInstance.post<WindAssessmentApiResponse>(
      "/api/Assessment/wind/basic",
      formattedData
    );
    console.log('✅ Wind Basic Assessment submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitBasicWindAssessment:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to submit a premium wind assessment
 * @param data Premium wind assessment request data
 * @returns Promise with assessment response
 */
/**
 * Function to validate wind power curve files for assessment
 * @param powerCurveFile Power curve file to validate
 * @returns Promise with validation response
 */
export const validateWindFiles = async (
  powerCurveFile: File
): Promise<WindFileValidationResponse> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", powerCurveFile, powerCurveFile.name);
    
    console.log("🚀 Validating wind power curve file...");
    
    // Create a custom axios instance for this request to avoid content-type issues
    const customAxios = axios.create({
      baseURL: axiosInstance.defaults.baseURL,
      timeout: 30000,
      headers: {
        // Don't set Content-Type here, let the browser set it with the boundary for FormData
        'Authorization': axiosInstance.defaults.headers.common['Authorization']
      }
    });
    
    // Use the custom axios instance for this file upload
    const response = await customAxios.post<WindFileValidationResponse>(
      "/api/Assessment/wind/validatefile",
      formData
    );
    
    // Check if the response contains the expected data
    if (response.data && typeof response.data === 'object') {
      console.log("✅ Wind file validation successful:", response.data);
      
      // If the response doesn't have a status field, add it
      if (!response.data.status) {
        response.data.status = "success";
      }
      
      return response.data;
    } else {
      // Handle unexpected response format
      console.error("❌ Unexpected response format:", response.data);
      return {
        status: "error",
        message: "Unexpected response format from server"
      };
    }
  } catch (error) {
    console.error("❌ API Error validating wind files:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Response status:", error.response?.status);
      
      // Return a formatted error response
      return {
        status: "error",
        message: error.response?.data?.message || error.message || "Error validating file"
      };
    }
    
    // Return a generic error for non-Axios errors
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error validating file"
    };
  }
};

export const submitPremiumWindAssessment = async (
  data: PremiumWindAssessmentRequest
): Promise<WindAssessmentApiResponse> => {
  try {
    // If a power curve file is provided, we need to upload it first
    if (data.powerCurveFile) {
      // Create a FormData object to send the file
      const formData = new FormData();
      
      // Append all non-file fields first, matching Swagger keys
      formData.append("location", data.location);
      formData.append("startDate", new Date(data.startDate).toISOString());
      formData.append("endDate", new Date(data.endDate).toISOString());
      formData.append("latitude", String(data.latitude));
      formData.append("longitude", String(data.longitude));
      formData.append("height", String(data.height)); 
      formData.append("hub_height", String(data.hub_height)); // Updated to snake_case
      formData.append("curve_model", data.curve_model ?? ''); // Updated to snake_case
      
      // Add new fields
      formData.append("file_path", data.file_path || '');
      formData.append("guid", data.guid || '');
      formData.append("aux", data.aux || '');
 
      // Append the file last
      formData.append("powerCurveFile", data.powerCurveFile);

      // Upload the file
      console.log("🚀 Uploading power curve file with updated FormData keys...");
      try {
        // Use the standard axios instance for the file upload request
        const response = await axiosInstance.post<WindAssessmentApiResponse>("/api/Assessment/wind/premium", formData);
        
        console.log("✅ Power curve file uploaded successfully");
        return response.data;
      } catch (uploadError) {
        console.error('❌ API Error uploading power curve file:', uploadError);
        throw uploadError;
      }
    } else {
      // No file upload needed, use the premium endpoint with snake_case field names
      
      // Convert string values to numbers for API
      const formattedData = {
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude as string) : data.latitude,
        longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude as string) : data.longitude,
        height: typeof data.height === 'string' ? parseFloat(data.height as string) : data.height,
        hub_height: typeof data.hub_height === 'string' ? parseFloat(data.hub_height as string) : data.hub_height, // Updated to snake_case
        curve_model: data.curve_model, // Updated to snake_case
        file_path: data.file_path || '',
        guid: data.guid || '',
        aux: data.aux || ''
      };
      
      // Submit the assessment
      console.log("🚀 Submitting Wind Premium Assessment:", formattedData);
      const response = await axiosInstance.post<WindAssessmentApiResponse>(
        "/api/Assessment/wind/premium",
        formattedData
      );
      console.log("✅ Wind Premium Assessment submission successful:", response.data);
      return response.data;
    }
  } catch (error) {
    console.error('❌ API Error in submitPremiumWindAssessment:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};
