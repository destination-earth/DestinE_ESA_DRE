/**
 * Utility functions for parsing CSV data for forecast visualizations
 */

/**
 * Parse CSV string into an array of objects
 * @param csvString The CSV string to parse
 * @param delimiter The delimiter used in the CSV (default: ',')
 * @returns Array of objects with keys from the header row
 */
export function parseCSV<T>(csvString: string, delimiter: string = ','): T[] {
  // Split the CSV string into lines
  const lines = csvString.trim().split('\n');
  
  // Get the header row and parse it
  const headers = lines[0].split(delimiter).map(header => header.trim());
  
  // Parse each data row
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(value => value.trim());
    const row: Record<string, string | number> = {};
    
    // Create an object with keys from headers and values from the current line
    headers.forEach((header, index) => {
      // Try to convert numeric values
      const value = values[index];
      row[header] = isNaN(Number(value)) ? value : Number(value);
    });
    
    return row as T;
  });
}

/**
 * Parse CSV data specifically for solar forecast
 * @param csvString The CSV string containing solar forecast data
 * @returns Object with parsed data for solar production and irradiance
 */
export interface SolarForecastDataPoint {
  timestamp: string;
  production: number;
  irradiance: number;
}

export function parseSolarForecastCSV(csvString: string): SolarForecastDataPoint[] {
  return parseCSV<SolarForecastDataPoint>(csvString);
}

/**
 * Parse CSV data specifically for wind forecast
 * @param csvString The CSV string containing wind forecast data
 * @returns Object with parsed data for wind production and speed
 */
export interface WindForecastDataPoint {
  timestamp: string;
  production: number;
  windSpeed: number;
}

export function parseWindForecastCSV(csvString: string): WindForecastDataPoint[] {
  return parseCSV<WindForecastDataPoint>(csvString);
}

/**
 * Load CSV data from a file
 * @param filePath Path to the CSV file
 * @returns Promise that resolves to the CSV content as a string
 */
export async function loadCSVFile(filePath: string): Promise<string> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
}
