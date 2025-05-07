// Types for API visualization responses

// Solar Visualization Data Structure
export interface SolarPowerOutput {
  datetime: string;
  value: number;
}

export interface SolarVisualizationData {
  ghi?: number[] | { value: number }[];
  dni?: number[] | { value: number }[];
  power_output?: SolarPowerOutput[];
}

// Wind Visualization Data Structure
export interface WindSpeedCount {
  xvalue: number;
  yvalue: number;
}

export interface DirectionalStat {
  direction: string;
  frequency: number;
  weibull_shape: number;
  weibull_scale: number;
  mean: number;
  nine_five: number;
  nine_seven: number;
  nine_nine: number;
}

export interface WindSpeedRange {
  label: string;
  data: number[];
}

export interface RoseDiagram {
  directions: string[];
  windspeedrange: WindSpeedRange[];
}

export interface ComplexDataPoint {
  datetime: string;
  wind_speed_in_m_per_s: number;
  power_in_kW?: number; // Optional as it might depend on assessment type or settings
}

export interface WindVisualizationData {
  count_wind_speed: WindSpeedCount[];
  directiona_stat_output: DirectionalStat[];
  rose_diagram: RoseDiagram;
  outputPower?: number[];
  complex?: ComplexDataPoint[]; // Add optional complex data for premium
  annual_stats?: AnnualStats; // Optional annual statistics
}

// --- Wind Forecast Visualization Data ---
interface ForecastVsTimeItem {
  poweroutput: number;
  windspeed: number;
  step: number;
  datetime: string;
}

interface RealVsForecastItem {
  poweroutput: number;
  powerforecast: number;
  step: number;
  datetime: string;
}

// Annual Stats interface for wind forecasts
export interface AnnualStats {
  // New field names based on updated backend response
  total_energy_potential_kWh: number;
  avg_power_output_kWh: number;
  capacity_factor_percent: number;
  avg_wind_power_density_W_m2: number;
  
  // Keep these for backward compatibility if needed
  total_energy_potential_kwh?: number;
  annual_avg_power_kwh?: number;
  annual_avg_capacity_factor_percent?: number;
  annual_avg_wind_speed_m_s?: number;
  annual_avg_wind_power_density_w_m2?: number;
  max_power_kW?: number;
}

export interface WindForecastVisualizationData {
  forecastvstime: ForecastVsTimeItem[];
  realvsforecast: RealVsForecastItem[];
  csv_link: string[];
  job_type: 'forecast';
  annual_stats?: AnnualStats; // Optional annual statistics
}

// --- Solar Forecast Visualization Data ---
interface SolarForecastVsTimeItem {
  power: number;
  irradiation: number;
  datetime: string;
}

export interface SolarForecastVisualizationData {
  forecastvstime: SolarForecastVsTimeItem[];
  job_type: 'forecast';
}

// Union type for all visualization responses
export type VisualizationData = 
  SolarVisualizationData | 
  WindVisualizationData | 
  WindForecastVisualizationData | 
  SolarForecastVisualizationData | 
  null;
