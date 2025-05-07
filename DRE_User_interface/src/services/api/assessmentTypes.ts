// assessmentTypes.ts
// Shared type definitions for assessment API services

/**
 * Common API response type for all assessment endpoints
 */
export interface AssessmentResponse {
  id: string;
  status: "success" | "processing" | "error";
  message?: string;
  data?: Record<string, unknown>;
}

/**
 * Month-value pair structure used in API responses
 */
export interface MonthValuePair {
  month: string;
  value: number;
}

/**
 * Common form fields shared between solar and wind assessment requests
 */
export interface CommonAssessmentRequest {
  startDate: string; // ISO date-time format
  location: string;
  endDate: string; // ISO date-time format
  latitude: number; // Number format as per API spec
  longitude: number; // Number format as per API spec
}

/**
 * Solar assessment API response structure
 */
export interface SolarAssessmentApiResponse {
  ghi?: MonthValuePair[];
  dni?: MonthValuePair[];
  csv_link?: string | string[];
  data?: {
    ghi?: MonthValuePair[];
    dni?: MonthValuePair[];
    csv_link?: string | string[];
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
  csv_link?: string | string[];
  output_power?: MonthValuePair[];
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
    csv_link?: string | string[];
  };
}

/**
 * Combined type for all possible API responses
 */
export type AssessmentApiResponse = SolarAssessmentApiResponse | WindAssessmentApiResponse;

/**
 * Basic solar assessment request type
 */
export interface BasicSolarAssessmentRequest extends CommonAssessmentRequest {
  file_path?: string; // Path to the file on server (from validation)
  guid?: string; // Unique identifier for the request
  aux?: string; // Optional auxiliary information
}

/**
 * Basic wind assessment request type
 */
export interface BasicWindAssessmentRequest extends CommonAssessmentRequest {
  height: number; // Hub height in meters
  file_path?: string; // Path to the file on server (from validation)
  guid?: string; // Unique identifier for the request
  aux?: string; // Optional auxiliary information
}

/**
 * Premium solar assessment request type
 */
export interface PremiumSolarAssessmentRequest extends BasicSolarAssessmentRequest {
  tilt: number; // Panel tilt angle in degrees
  azimuth: number; // Panel azimuth angle in degrees (0-360)
  tracking: number; // Tracking type (0: fixed, 1: single-axis, 2: dual-axis)
  capacity: number; // Capacity in kW
}

/**
 * Premium wind assessment request type
 */
export interface PremiumWindAssessmentRequest extends BasicWindAssessmentRequest {
  hub_height: number; // Hub height in meters
  curve_model: string; // Power curve model name or 'custom'
  powerCurveFile?: File | null; // File object for UI handling only
  templateFile?: File | null; // File object for UI handling only
}
