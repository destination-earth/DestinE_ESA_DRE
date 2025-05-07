// solarAssessmentApi.ts
// Solar assessment specific API services

import axios from 'axios';
import axiosInstance from './axiosConfig';
import {
  SolarAssessmentApiResponse,
  BasicSolarAssessmentRequest,
  PremiumSolarAssessmentRequest
} from './assessmentTypes';

/**
 * Function to get solar about information
 * @returns Promise with assessment response
 */
export const getSolarAbout = async (): Promise<SolarAssessmentApiResponse> => {
  const response = await axiosInstance.get<SolarAssessmentApiResponse>("/api/Assessment/solar/about");
  return response.data;
};

/**
 * Function to submit a basic solar assessment
 * @param data Basic solar assessment request data
 * @returns Promise with assessment response
 */
export const submitBasicSolarAssessment = async (
  data: BasicSolarAssessmentRequest
): Promise<SolarAssessmentApiResponse> => {
  // Convert string values to numbers for API
  const formattedData = {
    ...data,
    latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude as string) : data.latitude,
    longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude as string) : data.longitude,
    // Ensure dates are in ISO format
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    // Always include these fields, even if empty
    file_path: data.file_path || '',
    guid: data.guid || '',
    aux: data.aux || ''
  };
  
  try {
    const response = await axiosInstance.post<SolarAssessmentApiResponse>(
      "/api/Assessment/solar/basic",
      formattedData
    );
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitBasicSolarAssessment:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};

/**
 * Function to submit a premium solar assessment
 * @param data Premium solar assessment request data
 * @returns Promise with assessment response
 */
export const submitPremiumSolarAssessment = async (
  data: PremiumSolarAssessmentRequest
): Promise<SolarAssessmentApiResponse> => {
  // Convert string values to numbers for API and ensure proper field names
  const formattedData = {
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude as string) : data.latitude,
    longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude as string) : data.longitude,
    tilt: typeof data.tilt === 'string' ? parseInt(data.tilt as string) : data.tilt,
    azimuth: typeof data.azimuth === 'string' ? parseFloat(data.azimuth as string) : data.azimuth,
    tracking: typeof data.tracking === 'string' ? parseInt(data.tracking as string) : data.tracking,
    capacity: typeof data.capacity === 'string' ? parseFloat(data.capacity as string) : data.capacity,
    // Always include these fields, even if empty
    file_path: data.file_path || '',
    guid: data.guid || '',
    aux: data.aux || ''
  };
  
  try {
    console.log('Submitting premium solar assessment with data:', formattedData);
    const response = await axiosInstance.post<SolarAssessmentApiResponse>(
      "/api/Assessment/solar/premium",
      formattedData
    );
    
    console.log('🌟🌟🌟 PREMIUM SOLAR ASSESSMENT RESPONSE 🌟🌟🌟');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('🌟🌟🌟 END OF PREMIUM SOLAR ASSESSMENT RESPONSE 🌟🌟🌟');
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error in submitPremiumSolarAssessment:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
    }
    throw error;
  }
};
