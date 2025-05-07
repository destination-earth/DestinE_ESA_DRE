// forecastTypes.ts
// Type definitions for forecast API services

/**
 * Common API response type for all forecast endpoints
 */
export interface ForecastResponse {
  id: string;
  status: "success" | "processing" | "error";
  message?: string;
  data?: Record<string, unknown>;
}

/**
 * Data point structure for forecast vs time data
 */
export interface ForecastTimeDataPoint {
  datetime: string;
  power: number;
  irradiation: number;
}

/**
 * Data structure for real vs forecast comparison
 */
export interface RealVsForecastDataPoint {
  datetime: string;
  poweroutput: number;
  powerforecast: number;
  step: number;
}

/**
 * Solar forecast API response structure
 */
export interface SolarForecastApiResponse {
  forcastvstime: ForecastTimeDataPoint[];
  realvsforecast: RealVsForecastDataPoint[];
  csv_link: string[];
}

/**
 * Wind forecast API response structure - same structure as solar for now
 */
export interface WindForecastApiResponse {
  forcastvstime: ForecastTimeDataPoint[];
  realvsforecast: RealVsForecastDataPoint[];
  csv_link: string[];
}

/**
 * Combined type for all possible forecast API responses
 */
export type ForecastApiResponse = SolarForecastApiResponse | WindForecastApiResponse;

/**
 * Transformed data structure for time series chart
 */
export interface TimeSeriesDataPoint {
  datetime: string;
  powerKw?: number;
  power?: number;
  irradiation?: number;
}

/**
 * Transformed data structure for prediction comparison chart
 */
export interface PredictionComparisonPoint {
  step: number;
  datetime: string;
  actual: number;
  predicted: number;
}

/**
 * Transformed data for chart components
 */
export interface TransformedForecastData {
  timeSeriesData: TimeSeriesDataPoint[];
  predictionComparison: PredictionComparisonPoint[];
  csvLinks: string[];
}
