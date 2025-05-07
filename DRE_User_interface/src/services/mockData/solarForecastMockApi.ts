// solarForecastMockApi.ts
// Mock implementations of solar forecast API services

import { SolarForecastApiResponse, ForecastTimeDataPoint, RealVsForecastDataPoint } from '../api/forecastTypes';
import { StandardForecastParams, FileUploadResponse } from '../api/solarForecastApi';

// Helper function to simulate network delay
const simulateNetworkDelay = async (minMs = 300, maxMs = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock function to upload template file for forecast
 */
export const uploadForecastTemplate = async (
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _file: File,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _latitude: number,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _longitude: number,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _elevation: number
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of uploadForecastTemplate');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'File uploaded successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to submit standard forecast request with park specifications
 */
export const submitStandardForecast = async (
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _params: StandardForecastParams
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of submitStandardForecast');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Standard forecast submitted successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to upload template file for annual forecast
 */
export const uploadAnnualForecastTemplate = async (
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _file: File,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _latitude: number,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _longitude: number,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _elevation: number
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of uploadAnnualForecastTemplate');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Annual forecast file uploaded successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to submit standard annual forecast request with park specifications
 */
export const submitStandardAnnualForecast = async (
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _params: StandardForecastParams
): Promise<FileUploadResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of submitStandardAnnualForecast');
  
  // Return mock response
  return {
    jobid: `mock-job-${Date.now()}`,
    message: 'Standard annual forecast submitted successfully (MOCK)',
    status: 200
  };
};

/**
 * Mock function to get solar forecast time series data
 */
export const getSolarForecastTimeSeries = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getSolarForecastTimeSeries');
  
  try {
    // In a real implementation, this would read from the mock data files
    // For now, we'll return hardcoded mock data
    const mockForecastVsTime: ForecastTimeDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T01:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T02:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T03:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T04:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T05:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T06:00:00Z', power: 10, irradiation: 15 },
      { datetime: '2023-01-01T07:00:00Z', power: 25, irradiation: 35 },
      { datetime: '2023-01-01T08:00:00Z', power: 45, irradiation: 60 },
      { datetime: '2023-01-01T09:00:00Z', power: 65, irradiation: 85 },
      { datetime: '2023-01-01T10:00:00Z', power: 80, irradiation: 100 },
      { datetime: '2023-01-01T11:00:00Z', power: 90, irradiation: 110 },
      { datetime: '2023-01-01T12:00:00Z', power: 95, irradiation: 115 },
      { datetime: '2023-01-01T13:00:00Z', power: 90, irradiation: 110 },
      { datetime: '2023-01-01T14:00:00Z', power: 80, irradiation: 100 },
      { datetime: '2023-01-01T15:00:00Z', power: 65, irradiation: 85 },
      { datetime: '2023-01-01T16:00:00Z', power: 45, irradiation: 60 },
      { datetime: '2023-01-01T17:00:00Z', power: 25, irradiation: 35 },
      { datetime: '2023-01-01T18:00:00Z', power: 10, irradiation: 15 },
      { datetime: '2023-01-01T19:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T20:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T21:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T22:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T23:00:00Z', power: 0, irradiation: 0 },
    ];

    const mockRealVsForecast: RealVsForecastDataPoint[] = [
      { datetime: '2023-01-01T06:00:00Z', poweroutput: 8, powerforecast: 10, step: 1 },
      { datetime: '2023-01-01T07:00:00Z', poweroutput: 22, powerforecast: 25, step: 2 },
      { datetime: '2023-01-01T08:00:00Z', poweroutput: 40, powerforecast: 45, step: 3 },
      { datetime: '2023-01-01T09:00:00Z', poweroutput: 60, powerforecast: 65, step: 4 },
      { datetime: '2023-01-01T10:00:00Z', poweroutput: 75, powerforecast: 80, step: 5 },
      { datetime: '2023-01-01T11:00:00Z', poweroutput: 85, powerforecast: 90, step: 6 },
      { datetime: '2023-01-01T12:00:00Z', poweroutput: 90, powerforecast: 95, step: 7 },
      { datetime: '2023-01-01T13:00:00Z', poweroutput: 85, powerforecast: 90, step: 8 },
      { datetime: '2023-01-01T14:00:00Z', poweroutput: 75, powerforecast: 80, step: 9 },
      { datetime: '2023-01-01T15:00:00Z', poweroutput: 60, powerforecast: 65, step: 10 },
      { datetime: '2023-01-01T16:00:00Z', poweroutput: 40, powerforecast: 45, step: 11 },
      { datetime: '2023-01-01T17:00:00Z', poweroutput: 20, powerforecast: 25, step: 12 },
      { datetime: '2023-01-01T18:00:00Z', poweroutput: 8, powerforecast: 10, step: 13 },
    ];

    return {
      forcastvstime: mockForecastVsTime,
      realvsforecast: mockRealVsForecast,
      csv_link: ['/mock-data/solar/solar.csv', '/mock-data/solar/solarvs.csv']
    };
  } catch (error) {
    console.error('❌ Mock API Error in getSolarForecastTimeSeries:', error);
    throw error;
  }
};

/**
 * Mock function to get solar forecast prediction comparison data
 */
export const getSolarForecastPredictionComparison = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getSolarForecastPredictionComparison');
  
  try {
    // Similar to getSolarForecastTimeSeries but with different data pattern
    const mockForecastVsTime: ForecastTimeDataPoint[] = [
      { datetime: '2023-01-01T00:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T01:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T02:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T03:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T04:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T05:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T06:00:00Z', power: 12, irradiation: 18 },
      { datetime: '2023-01-01T07:00:00Z', power: 28, irradiation: 38 },
      { datetime: '2023-01-01T08:00:00Z', power: 48, irradiation: 65 },
      { datetime: '2023-01-01T09:00:00Z', power: 68, irradiation: 88 },
      { datetime: '2023-01-01T10:00:00Z', power: 82, irradiation: 105 },
      { datetime: '2023-01-01T11:00:00Z', power: 92, irradiation: 115 },
      { datetime: '2023-01-01T12:00:00Z', power: 98, irradiation: 120 },
      { datetime: '2023-01-01T13:00:00Z', power: 92, irradiation: 115 },
      { datetime: '2023-01-01T14:00:00Z', power: 82, irradiation: 105 },
      { datetime: '2023-01-01T15:00:00Z', power: 68, irradiation: 88 },
      { datetime: '2023-01-01T16:00:00Z', power: 48, irradiation: 65 },
      { datetime: '2023-01-01T17:00:00Z', power: 28, irradiation: 38 },
      { datetime: '2023-01-01T18:00:00Z', power: 12, irradiation: 18 },
      { datetime: '2023-01-01T19:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T20:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T21:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T22:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2023-01-01T23:00:00Z', power: 0, irradiation: 0 },
    ];

    const mockRealVsForecast: RealVsForecastDataPoint[] = [
      { datetime: '2023-01-01T06:00:00Z', poweroutput: 8, powerforecast: 12, step: 1 },
      { datetime: '2023-01-01T07:00:00Z', poweroutput: 22, powerforecast: 28, step: 2 },
      { datetime: '2023-01-01T08:00:00Z', poweroutput: 40, powerforecast: 48, step: 3 },
      { datetime: '2023-01-01T09:00:00Z', poweroutput: 60, powerforecast: 68, step: 4 },
      { datetime: '2023-01-01T10:00:00Z', poweroutput: 75, powerforecast: 82, step: 5 },
      { datetime: '2023-01-01T11:00:00Z', poweroutput: 85, powerforecast: 92, step: 6 },
      { datetime: '2023-01-01T12:00:00Z', poweroutput: 90, powerforecast: 98, step: 7 },
      { datetime: '2023-01-01T13:00:00Z', poweroutput: 85, powerforecast: 92, step: 8 },
      { datetime: '2023-01-01T14:00:00Z', poweroutput: 75, powerforecast: 82, step: 9 },
      { datetime: '2023-01-01T15:00:00Z', poweroutput: 60, powerforecast: 68, step: 10 },
      { datetime: '2023-01-01T16:00:00Z', poweroutput: 40, powerforecast: 48, step: 11 },
      { datetime: '2023-01-01T17:00:00Z', poweroutput: 20, powerforecast: 28, step: 12 },
      { datetime: '2023-01-01T18:00:00Z', poweroutput: 8, powerforecast: 12, step: 13 },
    ];

    return {
      forcastvstime: mockForecastVsTime,
      realvsforecast: mockRealVsForecast,
      csv_link: ['/mock-data/solar/solar.csv', '/mock-data/solar/solarvs.csv']
    };
  } catch (error) {
    console.error('❌ Mock API Error in getSolarForecastPredictionComparison:', error);
    throw error;
  }
};

/**
 * Mock function to get solar forecast about page data
 */
export const getSolarForecastAbout = async (): Promise<SolarForecastApiResponse> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK API] Using mock implementation of getSolarForecastAbout');
  
  try {
    // Return data that matches the CSV file (Nov 24-25, 2024 with 2-hour steps)
    const mockForecastVsTime: ForecastTimeDataPoint[] = [
      // November 24, 2024
      { datetime: '2024-11-24T00:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T02:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T04:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T06:00:00Z', power: 1438.6, irradiation: 0.1 },
      { datetime: '2024-11-24T08:00:00Z', power: 5066.6, irradiation: 0.4 },
      { datetime: '2024-11-24T10:00:00Z', power: 7242.6, irradiation: 0.5 },
      { datetime: '2024-11-24T12:00:00Z', power: 5193.7, irradiation: 0.4 },
      { datetime: '2024-11-24T14:00:00Z', power: 880.5, irradiation: 0.1 },
      { datetime: '2024-11-24T16:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T18:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T20:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-24T22:00:00Z', power: 0, irradiation: 0 },
      // November 25, 2024
      { datetime: '2024-11-25T00:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T02:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T04:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T06:00:00Z', power: 1700.2, irradiation: 0.1 },
      { datetime: '2024-11-25T08:00:00Z', power: 4824.9, irradiation: 0.4 },
      { datetime: '2024-11-25T10:00:00Z', power: 7483.2, irradiation: 0.5 },
      { datetime: '2024-11-25T12:00:00Z', power: 5238.6, irradiation: 0.4 },
      { datetime: '2024-11-25T14:00:00Z', power: 1000, irradiation: 0.1 },
      { datetime: '2024-11-25T16:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T18:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T20:00:00Z', power: 0, irradiation: 0 },
      { datetime: '2024-11-25T22:00:00Z', power: 0, irradiation: 0 },
    ];

    // For the second chart, we'll use data from solarvs.csv (Nov 22-23, 2024)
    const mockRealVsForecast: RealVsForecastDataPoint[] = [
      // November 22, 2024 - starting from 00:00
      { datetime: '2024-11-22T00:00:00Z', poweroutput: 0, powerforecast: 0, step: 1 },
      { datetime: '2024-11-22T02:00:00Z', poweroutput: 0, powerforecast: 0, step: 2 },
      { datetime: '2024-11-22T04:00:00Z', poweroutput: 0, powerforecast: 0, step: 3 },
      { datetime: '2024-11-22T06:00:00Z', poweroutput: 572.3, powerforecast: 1347.4, step: 4 },
      { datetime: '2024-11-22T08:00:00Z', poweroutput: 2135.5, powerforecast: 2619.1, step: 5 },
      { datetime: '2024-11-22T10:00:00Z', poweroutput: 5175.3, powerforecast: 4217.8, step: 6 },
      { datetime: '2024-11-22T12:00:00Z', poweroutput: 5677.2, powerforecast: 4057, step: 7 },
      { datetime: '2024-11-22T14:00:00Z', poweroutput: 4479, powerforecast: 3895.2, step: 8 },
      { datetime: '2024-11-22T16:00:00Z', poweroutput: 1738, powerforecast: 2312.6, step: 9 },
      { datetime: '2024-11-22T18:00:00Z', poweroutput: 987, powerforecast: 576.9, step: 10 },
      { datetime: '2024-11-22T20:00:00Z', poweroutput: 0, powerforecast: 0, step: 11 },
      { datetime: '2024-11-22T22:00:00Z', poweroutput: 0, powerforecast: 0, step: 12 },
      // November 23, 2024
      { datetime: '2024-11-23T00:00:00Z', poweroutput: 0, powerforecast: 0, step: 13 },
      { datetime: '2024-11-23T02:00:00Z', poweroutput: 0, powerforecast: 0, step: 14 },
      { datetime: '2024-11-23T04:00:00Z', poweroutput: 0, powerforecast: 0, step: 15 },
      { datetime: '2024-11-23T06:00:00Z', poweroutput: 0, powerforecast: 0, step: 16 },
      { datetime: '2024-11-23T08:00:00Z', poweroutput: 3470.7, powerforecast: 3081.4, step: 17 },
      { datetime: '2024-11-23T10:00:00Z', poweroutput: 4579.2, powerforecast: 5371, step: 18 },
      { datetime: '2024-11-23T12:00:00Z', poweroutput: 6812.6, powerforecast: 6395.5, step: 19 },
      { datetime: '2024-11-23T14:00:00Z', poweroutput: 2581.8, powerforecast: 5987.6, step: 20 },
      { datetime: '2024-11-23T16:00:00Z', poweroutput: 7703.5, powerforecast: 5377.4, step: 21 },
      { datetime: '2024-11-23T18:00:00Z', poweroutput: 2298.8, powerforecast: 1241.5, step: 22 },
      { datetime: '2024-11-23T20:00:00Z', poweroutput: 266.8, powerforecast: 101.7, step: 23 },
      { datetime: '2024-11-23T22:00:00Z', poweroutput: 0, powerforecast: 0, step: 24 },
      // November 24, 2024 - ending at 00:00
      { datetime: '2024-11-24T00:00:00Z', poweroutput: 0, powerforecast: 0, step: 25 },
    ];

    return {
      forcastvstime: mockForecastVsTime,
      realvsforecast: mockRealVsForecast,
      csv_link: ['/mock-data/solar/about/solar.csv', '/mock-data/solar/about/solarvs.csv']
    };
  } catch (error) {
    console.error('❌ Mock API Error in getSolarForecastAbout:', error);
    throw error;
  }
};

/**
 * Mock function to download the template file for solar one-off training
 */
export const downloadSolarOneOffTrainTemplate = async (): Promise<void> => {
  // Simulate network delay
  await simulateNetworkDelay(100, 300);
  
  console.debug('[MOCK API] Using mock implementation of downloadSolarOneOffTrainTemplate');
  
  // Create a Blob containing the CSV content
  const csvContent = "time_utc;Total_Production_active_power_in_kW_PCC;Ambient_Temperature_in_deg_C_OPTIONAL;Relative_Humidity_in_percentage_OPTIONAL;Wind_Speed_in_m_per_s_OPTIONAL;Total_Irradiacne_in_W_per_m2_OPTIONAL\n;;;;;";
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'solar_one_off_template.csv';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};
