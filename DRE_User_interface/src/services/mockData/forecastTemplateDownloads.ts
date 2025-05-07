// forecastTemplateDownloads.ts
// Functions for downloading forecast templates
// These remain as mock implementations since they're just for downloading templates

/**
 * Helper function to simulate network delay
 * @param minMs Minimum delay in milliseconds
 * @param maxMs Maximum delay in milliseconds
 */
const simulateNetworkDelay = async (minMs = 300, maxMs = 1200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock function to download the template file for solar one-off training
 */
export const downloadSolarOneOffTrainTemplate = async (): Promise<void> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK DOWNLOAD] Using mock implementation of downloadSolarOneOffTrainTemplate');
  
  // Create a mock CSV content
  const csvContent = `datetime,power_kw,temperature,irradiance,wind_speed
2023-01-01T00:00:00Z,0,5.2,0,3.1
2023-01-01T01:00:00Z,0,4.8,0,2.9
2023-01-01T02:00:00Z,0,4.5,0,2.7
2023-01-01T03:00:00Z,0,4.3,0,2.5
2023-01-01T04:00:00Z,0,4.1,0,2.4
2023-01-01T05:00:00Z,0,3.9,0,2.3
2023-01-01T06:00:00Z,5.2,4.2,10.5,2.2
2023-01-01T07:00:00Z,15.8,5.1,35.2,2.1
2023-01-01T08:00:00Z,42.3,6.5,95.7,2.3
2023-01-01T09:00:00Z,78.5,8.2,185.3,2.5
2023-01-01T10:00:00Z,112.7,10.1,275.8,2.8
2023-01-01T11:00:00Z,135.2,11.5,345.6,3.1
2023-01-01T12:00:00Z,142.8,12.3,365.2,3.3
2023-01-01T13:00:00Z,135.6,12.8,345.9,3.5
2023-01-01T14:00:00Z,115.3,12.5,285.7,3.7
2023-01-01T15:00:00Z,82.1,11.8,195.4,3.9
2023-01-01T16:00:00Z,45.2,10.5,105.8,4.1
2023-01-01T17:00:00Z,18.5,9.2,45.3,4.2
2023-01-01T18:00:00Z,5.8,8.1,15.2,4.0
2023-01-01T19:00:00Z,0,7.5,0,3.8
2023-01-01T20:00:00Z,0,7.0,0,3.5
2023-01-01T21:00:00Z,0,6.5,0,3.3
2023-01-01T22:00:00Z,0,6.1,0,3.1
2023-01-01T23:00:00Z,0,5.8,0,2.9`;

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  // Create a download link and trigger the download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'solar_forecast_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Mock function to download the template file for wind one-off training
 */
export const downloadWindOneOffTrainTemplate = async (): Promise<void> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  console.debug('[MOCK DOWNLOAD] Using mock implementation of downloadWindOneOffTrainTemplate');
  
  // Create a mock CSV content
  const csvContent = `datetime,power_kw,temperature,wind_speed,wind_direction
2023-01-01T00:00:00Z,450.2,5.2,8.1,270
2023-01-01T01:00:00Z,425.8,4.8,7.9,275
2023-01-01T02:00:00Z,410.5,4.5,7.7,280
2023-01-01T03:00:00Z,395.3,4.3,7.5,282
2023-01-01T04:00:00Z,380.1,4.1,7.4,285
2023-01-01T05:00:00Z,375.9,3.9,7.3,287
2023-01-01T06:00:00Z,385.2,4.2,7.5,290
2023-01-01T07:00:00Z,415.8,5.1,8.1,292
2023-01-01T08:00:00Z,542.3,6.5,9.7,295
2023-01-01T09:00:00Z,678.5,8.2,11.3,298
2023-01-01T10:00:00Z,812.7,10.1,13.8,300
2023-01-01T11:00:00Z,935.2,11.5,15.6,302
2023-01-01T12:00:00Z,1042.8,12.3,16.2,305
2023-01-01T13:00:00Z,1035.6,12.8,15.9,308
2023-01-01T14:00:00Z,985.3,12.5,14.7,310
2023-01-01T15:00:00Z,882.1,11.8,13.4,312
2023-01-01T16:00:00Z,745.2,10.5,11.8,315
2023-01-01T17:00:00Z,618.5,9.2,10.3,318
2023-01-01T18:00:00Z,505.8,8.1,9.2,320
2023-01-01T19:00:00Z,480.0,7.5,8.8,322
2023-01-01T20:00:00Z,465.0,7.0,8.5,325
2023-01-01T21:00:00Z,450.5,6.5,8.3,328
2023-01-01T22:00:00Z,435.1,6.1,8.1,330
2023-01-01T23:00:00Z,420.8,5.8,7.9,332`;

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  // Create a download link and trigger the download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'wind_forecast_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
