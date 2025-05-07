import { loadCSVFile, parseSolarForecastCSV, parseWindForecastCSV, SolarForecastDataPoint, WindForecastDataPoint } from '../../utils/csvParser';

// Mock API for forecast data
export interface ForecastData {
  id: string;
  energyType: 'solar' | 'wind';
  data: SolarForecastDataPoint[] | WindForecastDataPoint[];
}

// In-memory cache for loaded forecast data
const forecastDataCache = new Map<string, ForecastData>();

/**
 * Get forecast data for a specific order
 * @param orderId The ID of the order to get forecast data for
 * @returns Promise that resolves to the forecast data
 */
export async function getForecastData(orderId: string, energyType: 'solar' | 'wind'): Promise<ForecastData> {
  // Check if we already have this data in cache
  if (forecastDataCache.has(orderId)) {
    return forecastDataCache.get(orderId)!;
  }

  try {
    // Determine the path to the CSV file based on the energy type
    const csvPath = energyType === 'solar'
      ? '/data/solar_forecast.csv'  // This will be replaced with the actual path provided by the user
      : '/data/wind_forecast.csv';  // This will be replaced with the actual path provided by the user

    // Load and parse the CSV data
    const csvData = await loadCSVFile(csvPath);
    
    // Parse the CSV data based on the energy type
    const parsedData = energyType === 'solar'
      ? parseSolarForecastCSV(csvData)
      : parseWindForecastCSV(csvData);

    // Create the forecast data object
    const forecastData: ForecastData = {
      id: orderId,
      energyType,
      data: parsedData
    };

    // Cache the data for future requests
    forecastDataCache.set(orderId, forecastData);

    return forecastData;
  } catch (error) {
    console.error('Error getting forecast data:', error);
    throw error;
  }
}

/**
 * Clear the forecast data cache
 */
export function clearForecastDataCache(): void {
  forecastDataCache.clear();
}
