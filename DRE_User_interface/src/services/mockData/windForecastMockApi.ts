// windForecastMockApi.ts
// Mock implementations of wind forecast API services

import { SolarForecastApiResponse, ForecastTimeDataPoint, RealVsForecastDataPoint } from '../api/forecastTypes';
import { FileUploadResponse, WindForecastParams } from '../api/windForecastApi';

// Helper function to simulate network delay
const simulateNetworkDelay = async (minMs = 300, maxMs = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock function to upload template file for wind forecast
 */
export const uploadWindForecastTemplate = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _file: File,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _latitude: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _longitude: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _elevation: number
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of uploadWindForecastTemplate');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'File uploaded successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to submit standard wind forecast request with park specifications
 */
export const submitStandardWindForecast = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: WindForecastParams
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of submitStandardWindForecast');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Standard forecast submitted successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to upload template file for annual wind forecast
 */
export const uploadAnnualWindForecastTemplate = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _file: File,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _latitude: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _longitude: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _elevation: number
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of uploadAnnualWindForecastTemplate');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Annual forecast file uploaded successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to submit standard annual wind forecast request with park specifications
 */
export const submitStandardAnnualWindForecast = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: WindForecastParams
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of submitStandardAnnualWindForecast');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Standard annual forecast submitted successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to get wind forecast time series data
 */
export const getWindForecastTimeSeries = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getWindForecastTimeSeries');
  
  try {
    // Wind data has a different pattern than solar
    const mockForecastVsTime: ForecastTimeDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', power: 30, irradiation: 0 },
      { datetime: '2023-01-01T01:00:00Z', power: 32, irradiation: 0 },
      { datetime: '2023-01-01T02:00:00Z', power: 35, irradiation: 0 },
      { datetime: '2023-01-01T03:00:00Z', power: 38, irradiation: 0 },
      { datetime: '2023-01-01T04:00:00Z', power: 40, irradiation: 0 },
      { datetime: '2023-01-01T05:00:00Z', power: 45, irradiation: 0 },
      { datetime: '2023-01-01T06:00:00Z', power: 50, irradiation: 0 },
      { datetime: '2023-01-01T07:00:00Z', power: 55, irradiation: 0 },
      { datetime: '2023-01-01T08:00:00Z', power: 60, irradiation: 0 },
      { datetime: '2023-01-01T09:00:00Z', power: 65, irradiation: 0 },
      { datetime: '2023-01-01T10:00:00Z', power: 70, irradiation: 0 },
      { datetime: '2023-01-01T11:00:00Z', power: 75, irradiation: 0 },
      { datetime: '2023-01-01T12:00:00Z', power: 80, irradiation: 0 },
      { datetime: '2023-01-01T13:00:00Z', power: 75, irradiation: 0 },
      { datetime: '2023-01-01T14:00:00Z', power: 70, irradiation: 0 },
      { datetime: '2023-01-01T15:00:00Z', power: 65, irradiation: 0 },
      { datetime: '2023-01-01T16:00:00Z', power: 60, irradiation: 0 },
      { datetime: '2023-01-01T17:00:00Z', power: 55, irradiation: 0 },
      { datetime: '2023-01-01T18:00:00Z', power: 50, irradiation: 0 },
      { datetime: '2023-01-01T19:00:00Z', power: 45, irradiation: 0 },
      { datetime: '2023-01-01T20:00:00Z', power: 40, irradiation: 0 },
      { datetime: '2023-01-01T21:00:00Z', power: 35, irradiation: 0 },
      { datetime: '2023-01-01T22:00:00Z', power: 32, irradiation: 0 },
      { datetime: '2023-01-01T23:00:00Z', power: 30, irradiation: 0 },
    ];

    const mockRealVsForecast: RealVsForecastDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', poweroutput: 28, powerforecast: 30, step: 1 },
      { datetime: '2023-01-01T01:00:00Z', poweroutput: 30, powerforecast: 32, step: 2 },
      { datetime: '2023-01-01T02:00:00Z', poweroutput: 33, powerforecast: 35, step: 3 },
      { datetime: '2023-01-01T03:00:00Z', poweroutput: 36, powerforecast: 38, step: 4 },
      { datetime: '2023-01-01T04:00:00Z', poweroutput: 38, powerforecast: 40, step: 5 },
      { datetime: '2023-01-01T05:00:00Z', poweroutput: 42, powerforecast: 45, step: 6 },
      { datetime: '2023-01-01T06:00:00Z', poweroutput: 47, powerforecast: 50, step: 7 },
      { datetime: '2023-01-01T07:00:00Z', poweroutput: 52, powerforecast: 55, step: 8 },
      { datetime: '2023-01-01T08:00:00Z', poweroutput: 57, powerforecast: 60, step: 9 },
      { datetime: '2023-01-01T09:00:00Z', poweroutput: 62, powerforecast: 65, step: 10 },
      { datetime: '2023-01-01T10:00:00Z', poweroutput: 67, powerforecast: 70, step: 11 },
      { datetime: '2023-01-01T11:00:00Z', poweroutput: 72, powerforecast: 75, step: 12 },
      { datetime: '2023-01-01T12:00:00Z', poweroutput: 77, powerforecast: 80, step: 13 },
      { datetime: '2023-01-01T13:00:00Z', poweroutput: 72, powerforecast: 75, step: 14 },
      { datetime: '2023-01-01T14:00:00Z', poweroutput: 67, powerforecast: 70, step: 15 },
      { datetime: '2023-01-01T15:00:00Z', poweroutput: 62, powerforecast: 65, step: 16 },
      { datetime: '2023-01-01T16:00:00Z', poweroutput: 57, powerforecast: 60, step: 17 },
      { datetime: '2023-01-01T17:00:00Z', poweroutput: 52, powerforecast: 55, step: 18 },
      { datetime: '2023-01-01T18:00:00Z', poweroutput: 47, powerforecast: 50, step: 19 },
      { datetime: '2023-01-01T19:00:00Z', poweroutput: 42, powerforecast: 45, step: 20 },
      { datetime: '2023-01-01T20:00:00Z', poweroutput: 38, powerforecast: 40, step: 21 },
      { datetime: '2023-01-01T21:00:00Z', poweroutput: 33, powerforecast: 35, step: 22 },
      { datetime: '2023-01-01T22:00:00Z', poweroutput: 30, powerforecast: 32, step: 23 },
      { datetime: '2023-01-01T23:00:00Z', poweroutput: 28, powerforecast: 30, step: 24 },
    ];

    return {
      forcastvstime: mockForecastVsTime,
      realvsforecast: mockRealVsForecast,
      csv_link: ['/mock-data/wind/wind.csv', '/mock-data/wind/windvs.csv']
    };
  } catch (error) {
    console.error('❌ Mock API Error in getWindForecastTimeSeries:', error);
    throw error;
  }
};

/**
 * Mock function to get wind forecast prediction comparison data
 */
export const getWindForecastPredictionComparison = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getWindForecastPredictionComparison');
  
  try {
    // Similar to getWindForecastTimeSeries but with different data pattern
    const mockForecastVsTime: ForecastTimeDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', power: 35, irradiation: 0 },
      { datetime: '2023-01-01T01:00:00Z', power: 40, irradiation: 0 },
      { datetime: '2023-01-01T02:00:00Z', power: 45, irradiation: 0 },
      { datetime: '2023-01-01T03:00:00Z', power: 50, irradiation: 0 },
      { datetime: '2023-01-01T04:00:00Z', power: 55, irradiation: 0 },
      { datetime: '2023-01-01T05:00:00Z', power: 60, irradiation: 0 },
      { datetime: '2023-01-01T06:00:00Z', power: 65, irradiation: 0 },
      { datetime: '2023-01-01T07:00:00Z', power: 70, irradiation: 0 },
      { datetime: '2023-01-01T08:00:00Z', power: 75, irradiation: 0 },
      { datetime: '2023-01-01T09:00:00Z', power: 80, irradiation: 0 },
      { datetime: '2023-01-01T10:00:00Z', power: 85, irradiation: 0 },
      { datetime: '2023-01-01T11:00:00Z', power: 90, irradiation: 0 },
      { datetime: '2023-01-01T12:00:00Z', power: 95, irradiation: 0 },
      { datetime: '2023-01-01T13:00:00Z', power: 90, irradiation: 0 },
      { datetime: '2023-01-01T14:00:00Z', power: 85, irradiation: 0 },
      { datetime: '2023-01-01T15:00:00Z', power: 80, irradiation: 0 },
      { datetime: '2023-01-01T16:00:00Z', power: 75, irradiation: 0 },
      { datetime: '2023-01-01T17:00:00Z', power: 70, irradiation: 0 },
      { datetime: '2023-01-01T18:00:00Z', power: 65, irradiation: 0 },
      { datetime: '2023-01-01T19:00:00Z', power: 60, irradiation: 0 },
      { datetime: '2023-01-01T20:00:00Z', power: 55, irradiation: 0 },
      { datetime: '2023-01-01T21:00:00Z', power: 50, irradiation: 0 },
      { datetime: '2023-01-01T22:00:00Z', power: 45, irradiation: 0 },
      { datetime: '2023-01-01T23:00:00Z', power: 40, irradiation: 0 },
    ];

    const mockRealVsForecast: RealVsForecastDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', poweroutput: 32, powerforecast: 35, step: 1 },
      { datetime: '2023-01-01T01:00:00Z', poweroutput: 37, powerforecast: 40, step: 2 },
      { datetime: '2023-01-01T02:00:00Z', poweroutput: 42, powerforecast: 45, step: 3 },
      { datetime: '2023-01-01T03:00:00Z', poweroutput: 47, powerforecast: 50, step: 4 },
      { datetime: '2023-01-01T04:00:00Z', poweroutput: 52, powerforecast: 55, step: 5 },
      { datetime: '2023-01-01T05:00:00Z', poweroutput: 57, powerforecast: 60, step: 6 },
      { datetime: '2023-01-01T06:00:00Z', poweroutput: 62, powerforecast: 65, step: 7 },
      { datetime: '2023-01-01T07:00:00Z', poweroutput: 67, powerforecast: 70, step: 8 },
      { datetime: '2023-01-01T08:00:00Z', poweroutput: 72, powerforecast: 75, step: 9 },
      { datetime: '2023-01-01T09:00:00Z', poweroutput: 77, powerforecast: 80, step: 10 },
      { datetime: '2023-01-01T10:00:00Z', poweroutput: 82, powerforecast: 85, step: 11 },
      { datetime: '2023-01-01T11:00:00Z', poweroutput: 87, powerforecast: 90, step: 12 },
      { datetime: '2023-01-01T12:00:00Z', poweroutput: 92, powerforecast: 95, step: 13 },
      { datetime: '2023-01-01T13:00:00Z', poweroutput: 87, powerforecast: 90, step: 14 },
      { datetime: '2023-01-01T14:00:00Z', poweroutput: 82, powerforecast: 85, step: 15 },
      { datetime: '2023-01-01T15:00:00Z', poweroutput: 77, powerforecast: 80, step: 16 },
      { datetime: '2023-01-01T16:00:00Z', poweroutput: 72, powerforecast: 75, step: 17 },
      { datetime: '2023-01-01T17:00:00Z', poweroutput: 67, powerforecast: 70, step: 18 },
      { datetime: '2023-01-01T18:00:00Z', poweroutput: 62, powerforecast: 65, step: 19 },
      { datetime: '2023-01-01T19:00:00Z', poweroutput: 57, powerforecast: 60, step: 20 },
      { datetime: '2023-01-01T20:00:00Z', poweroutput: 52, powerforecast: 55, step: 21 },
      { datetime: '2023-01-01T21:00:00Z', poweroutput: 47, powerforecast: 50, step: 22 },
      { datetime: '2023-01-01T22:00:00Z', poweroutput: 42, powerforecast: 45, step: 23 },
      { datetime: '2023-01-01T23:00:00Z', poweroutput: 37, powerforecast: 40, step: 24 },
    ];

    return {
      forcastvstime: mockForecastVsTime,
      realvsforecast: mockRealVsForecast,
      csv_link: ['/mock-data/wind/wind.csv', '/mock-data/wind/windvs.csv']
    };
  } catch (error) {
    console.error('❌ Mock API Error in getWindForecastPredictionComparison:', error);
    throw error;
  }
};

/**
 * Mock function to get wind forecast about page data
 */
export const getWindForecastAbout = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getWindForecastAbout');
  
  const mockForecastVsTime: ForecastTimeDataPoint[] = [
    { datetime: '2023-01-01T08:00:00Z', power: 60, irradiation: 0 },
    { datetime: '2023-01-01T09:00:00Z', power: 65, irradiation: 0 },
  ];

  const mockRealVsForecast: RealVsForecastDataPoint[] = [
    { datetime: '2023-01-01T08:00:00Z', poweroutput: 57, powerforecast: 60, step: 1 },
    { datetime: '2023-01-01T09:00:00Z', poweroutput: 62, powerforecast: 65, step: 2 },
  ];

  return {
    forcastvstime: mockForecastVsTime,
    realvsforecast: mockRealVsForecast,
    csv_link: ['/mock-data/wind/about/wind.csv', '/mock-data/wind/about/wind-vs.csv']
  };
};

/**
 * Mock function to download the template file for wind one-off training
 */
export const downloadWindOneOffTrainTemplate = async (): Promise<void> => {
  // Simulate network delay
  await simulateNetworkDelay(100, 300);
  
  console.debug('[MOCK API] Using mock implementation of downloadWindOneOffTrainTemplate');
  
  // In a real implementation, this would fetch the file from the server
  // For this mock implementation, we'll create a CSV string with the template content
  const csvContent = "time_utc,power_in_kW,wind_speed_in_m_per_s,wind_direction_in_deg_optional,temperature_in_C_optional,pressure_in_Pa_optional,humidity_in_%_optional";
  
  // Create a Blob containing the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'wind_power_input_data_template.csv';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};
