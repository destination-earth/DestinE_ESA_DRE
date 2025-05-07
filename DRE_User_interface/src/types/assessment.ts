// assessment.ts
// Centralized type definitions for assessment components

import { MonthValuePair } from "../components/assessment/assessmentUtils";

/**
 * Common form fields shared between solar and wind assessment forms
 */
export interface CommonFormFields {
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
}

/**
 * Solar assessment form data
 */
export interface SolarFormData extends CommonFormFields {
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
}

/**
 * Wind assessment form data
 */
export interface WindFormData extends CommonFormFields {
  hubHeight: string;
  powerCurveModel: string;
}

/**
 * Union type for all assessment form data
 */
export type AssessmentFormData = SolarFormData | WindFormData;

/**
 * Solar assessment API response structure
 */
export interface SolarAssessmentApiResponse {
  ghi?: MonthValuePair[];
  dni?: MonthValuePair[];
  csv_link?: string;
  data?: {
    ghi?: MonthValuePair[];
    dni?: MonthValuePair[];
    csv_link?: string;
  };
  status?: string;
  message?: string;
  // Premium-specific fields
  output_power?: MonthValuePair[];
  output_power_hour?: Array<{
    datetime: string;
    powerKw: number;
    solarIrradiation: number;
    ambientTemperature: number;
    powerKwDust: number;
    solarIrradiationDust: number;
  }>;
  capacity?: number;
  tilt?: number;
  azimuth?: number;
  tracking?: number;
}

/**
 * Wind assessment API response structure
 */
export interface WindAssessmentApiResponse {
  windSpeed?: MonthValuePair[];
  count_wind_speed?: Array<{ xvalue: number; yvalue: number }>;
  directiona_stat_output?: Array<{
    direction: string;
    frequency: number;
    weibull_shape: number;
    weibull_scale: number;
    mean: number;
    nine_five: number;
    nine_seven: number;
    nine_nine: number;
  }>;
  rose_diagram?: {
    directions: string[];
    windspeedrange: Array<{
      label: string;
      data: number[];
    }>;
  };
  csv_link?: string;
  data?: {
    windSpeed?: MonthValuePair[];
    count_wind_speed?: Array<{ xvalue: number; yvalue: number }>;
    directiona_stat_output?: Array<{
      direction: string;
      frequency: number;
      weibull_shape: number;
      weibull_scale: number;
      mean: number;
      nine_five: number;
      nine_seven: number;
      nine_nine: number;
    }>;
    rose_diagram?: {
      directions: string[];
      windspeedrange: Array<{
        label: string;
        data: number[];
      }>;
    };
    csv_link?: string;
  };
  status?: string;
  message?: string;
  // Premium-specific fields
  energyOutput?: MonthValuePair[];
  energyOutputMonthly?: MonthValuePair[];
  hubHeight?: number;
  powerCurveModel?: string;
}

/**
 * Union type for all assessment API responses
 */
export type AssessmentApiResponse = SolarAssessmentApiResponse | WindAssessmentApiResponse;

/**
 * Basic solar assessment request parameters
 */
export interface BasicSolarAssessmentRequest {
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
}

/**
 * Basic wind assessment request parameters
 */
export interface BasicWindAssessmentRequest extends BasicSolarAssessmentRequest {
  height: number;
}

/**
 * Premium solar assessment request parameters
 */
export interface PremiumSolarAssessmentRequest extends BasicSolarAssessmentRequest {
  tilt: number;
  azimuth: number;
  tracking: number;
  capacity: number;
}

/**
 * Premium wind assessment request parameters
 */
export interface PremiumWindAssessmentRequest extends BasicWindAssessmentRequest {
  powerCurveModel: string;
}
