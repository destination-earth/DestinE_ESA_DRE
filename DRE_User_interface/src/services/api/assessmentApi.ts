// assessmentApi.ts
// Unified entry point for all assessment API services

import { AssessmentResponse } from "./assessmentTypes";
import axiosInstance from './axiosConfig';

// Re-export all types from assessmentTypes
export * from "./assessmentTypes";

// Re-export all functions from solar and wind assessment APIs
// Explicitly export functions if needed, or rely on direct imports in consuming code
export { getSolarAbout, submitBasicSolarAssessment, submitPremiumSolarAssessment } from "./solarAssessmentApi";
export { getWindAbout, submitBasicWindAssessment, submitPremiumWindAssessment, getWindBasic } from "./windAssessmentApi";

/**
 * Function to initialize assessment
 * @returns Promise with assessment response
 */
export const initializeAssessment = async (): Promise<AssessmentResponse> => {
  const response = await axiosInstance.get<AssessmentResponse>("/api/Assessment/initialize");
  return response.data;
};
