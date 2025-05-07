import React, { useMemo, useEffect } from "react";
// import Chart from "react-apexcharts";
import SolarCharts from "../assessment/assessmentCharts/SolarCharts";
import WindCharts from "../assessment/assessmentCharts/WindCharts";
// Import forecast chart components
import ForecastTimeSeriesChart from "../forecast/ForecastTimeSeriesChart"; 
import WindPowerSpeedChart from "../forecast/WindPowerSpeedChart"; 
import WindActualVsPredictedChart from "../forecast/WindActualVsPredictedChart";

import { Job } from '../../hooks/useJobsApi'; 
import { 
  VisualizationData, 
  SolarVisualizationData, 
  WindVisualizationData, 
  WindForecastVisualizationData, 
  SolarForecastVisualizationData,
  SolarPowerOutput 
} from '../../types/visualization';

interface VisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  data: VisualizationData | null;
}

const VisualizationModal: React.FC<VisualizationModalProps> = ({ isOpen, onClose, job, data }) => {

  // Helper function to extract numeric values from potential array formats
  const extractValues = (input?: number[] | { value: number }[]): number[] => {
    if (!input || input.length === 0) return [];
    // Check the type of the first element to determine the format
    if (typeof input[0] === 'number') {
      return input as number[]; // It's already a number array
    } else if (typeof input[0] === 'object' && input[0] !== null && 'value' in input[0]) {
      // It's an array of objects like { value: number }
      return (input as { value: number }[]).map(item => item.value);
    }
    return []; // Return empty array if format is unexpected
  };

  // Type guards for solar and wind data
  const isSolarData = (d: VisualizationData): d is SolarVisualizationData =>
    !!(d && (typeof (d as SolarVisualizationData).ghi !== 'undefined' || typeof (d as SolarVisualizationData).dni !== 'undefined'));
  const isWindData = (d: VisualizationData): d is WindVisualizationData =>
    !!(d && typeof (d as WindVisualizationData).count_wind_speed !== 'undefined');
  const isWindForecastData = (d: VisualizationData): d is WindForecastVisualizationData => 
    !!(d && Array.isArray((d as WindForecastVisualizationData).forecastvstime) && Array.isArray((d as WindForecastVisualizationData).realvsforecast));
  const isSolarForecastData = (d: VisualizationData): d is SolarForecastVisualizationData => 
    !!(d && (d as SolarForecastVisualizationData).job_type === 'forecast' && Array.isArray((d as SolarForecastVisualizationData).forecastvstime));

  // Consolidate data extraction and processing in a top-level useMemo
  const chartData = useMemo(() => {
    // Return default/empty state if job or data is missing (avoids errors inside memo)
    if (!job || !data) {
      return {
        isPremium: false,
        ghiData: [],
        dniData: [],
        formattedPowerOutputData: [],
        annualStats: null,
      };
    }

    const isPremium = job.plan === "premium";

    // --- Solar Data Extraction ---
    let ghiData: number[] = [];
    let dniData: number[] = [];
    let formattedPowerOutputData: SolarPowerOutput[] = []; // Use SolarPowerOutput type

    if (job.energySource === "solar" && isSolarData(data)) {
      ghiData = extractValues(data.ghi);
      dniData = extractValues(data.dni);
      // Access power_output directly - it's already in the correct format
      formattedPowerOutputData = data.power_output || [];
    }

    // --- Wind Data Extraction and Annual Stats ---
    // Extract annual_stats if available (for wind assessment jobs only)
    let annualStats = null;
    if (job.energySource === 'wind' && job.requestType === 'assessment' && isWindData(data)) {
      // Log the raw annual_stats data from the API
      console.log('Raw annual_stats from API:', data.annual_stats);
      annualStats = data.annual_stats || null;
    }

    return {
      isPremium,
      ghiData,
      dniData,
      formattedPowerOutputData,
      annualStats,
    };

  }, [data, job]); // Depends only on stable props

  // Force ApexCharts to recalculate layout after modal opens
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100); // Wait for modal to be visible
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Conditional Return (after hooks)
  if (!isOpen || !job || !data) return null; 
  
  // Debug logging to see the actual data structure
  console.log('VisualizationModal data:', data);
  console.log('VisualizationModal chartData:', chartData);

  // --- Wind Forecast Data Extraction (can now use type guards) ---
  let forecastTimeLabels: string[] = [];
  let forecastPowerOutput: number[] = [];
  let forecastWindSpeed: number[] = [];
  let comparisonTimeLabels: string[] = [];
  let comparisonActualPower: number[] = [];
  let comparisonForecastPower: number[] = [];

  if (job?.requestType === 'forecast' && job.energySource === 'wind' && isWindForecastData(data)) {
    // Inside this block, 'data' is correctly typed as WindForecastVisualizationData
    forecastTimeLabels = data.forecastvstime.map((item: { datetime: string }) => item.datetime);
    forecastPowerOutput = data.forecastvstime.map((item: { poweroutput: number }) => item.poweroutput);
    forecastWindSpeed = data.forecastvstime.map((item: { windspeed: number }) => item.windspeed);

    comparisonTimeLabels = data.realvsforecast.map((item: { datetime: string }) => item.datetime);
    comparisonActualPower = data.realvsforecast.map((item: { poweroutput: number }) => item.poweroutput);
    comparisonForecastPower = data.realvsforecast.map((item: { powerforecast: number }) => item.powerforecast);
  }

  // Modal styling copied from ForecastVisualizationModal
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative h-[90vh] w-[90vw] max-w-maxxl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        {/* Modal header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-xl font-semibold">
            {job.energySource === "wind"
              ? "Wind Energy Visualization"
              : "Solar Energy Visualization"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content: Render charts based on energySource and plan */}
        <div className="mb-6 space-y-8" style={{ minHeight: 600, minWidth: 600 }}>

          {job.energySource === "solar" ? (
            // --- SOLAR --- 
            job.requestType === 'forecast' && isSolarForecastData(data) ? (
              // --- SOLAR FORECAST --- Render ForecastTimeSeriesChart
              <ForecastTimeSeriesChart 
                // The chart expects data in TimeSeriesDataPoint[] format.
                // SolarForecastVsTimeItem structure matches the expected fields (datetime, power, irradiation).
                data={data.forecastvstime} 
                isLoading={false} // Assuming data is already loaded when modal opens
                energyType='solar' 
              />
            ) : (
              // --- SOLAR ASSESSMENT --- (Existing logic)
              <SolarCharts
                key={isOpen ? 'open-solar-assess' : 'closed-solar-assess'} // Ensure key is unique
                ghiData={chartData.ghiData} // Use data from useMemo
                dniData={chartData.dniData} // Use data from useMemo
                powerOutputData={chartData.formattedPowerOutputData} // Use data from useMemo
                showTimeBasedChart={chartData.isPremium} // Use data from useMemo
              />
            )
          ) : job.energySource === "wind" ? (
            // --- WIND --- 
            job.requestType === 'forecast' ? (
              // --- WIND FORECAST --- 
              <div className="space-y-8">
                <WindPowerSpeedChart 
                  key={isOpen ? 'open-wind-forecast-power' : 'closed-wind-forecast-power'} // Add unique key
                  labels={forecastTimeLabels}
                  powerData={forecastPowerOutput}
                  windSpeedData={forecastWindSpeed}
                />
                <WindActualVsPredictedChart 
                  key={isOpen ? 'open-wind-forecast-compare' : 'closed-wind-forecast-compare'} // Add unique key
                  labels={comparisonTimeLabels}
                  actualPowerData={comparisonActualPower}
                  forecastPowerData={comparisonForecastPower}
                />
              </div>
            ) : (
              // --- WIND ASSESSMENT --- (Existing logic)
              <WindCharts
                key={isOpen ? 'open-wind-assess' : 'closed-wind-assess'} // Add unique key
                countWindSpeed={isWindData(data) ? data.count_wind_speed : []}
                directionalStats={isWindData(data) ? data.directiona_stat_output : []}
                roseDiagram={isWindData(data) ? data.rose_diagram : { directions: [], windspeedrange: [] }}
                complexData={isWindData(data) ? data.complex : undefined} // Pass complex data if available
                outputPower={chartData.isPremium && isWindData(data) ? data.outputPower : undefined}
              />
            )
          ) : (
            <div className="text-center text-red-500">Unknown energy source</div>
          )}
          
          {/* Annual Stats Table - Show only for premium wind assessment jobs with annual_stats */}
          {job.energySource === 'wind' && job.requestType === 'assessment' && chartData.isPremium && chartData.annualStats && (
            <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 shadow">
              <h3 className="p-4 text-lg font-semibold">Annual Statistics</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* Show max_power_kW if available (current backend response) */}
                  {chartData.annualStats.max_power_kW !== undefined && (
                    <tr className="bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Maximum Power (kW)
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        {chartData.annualStats.max_power_kW.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  {/* Show new fields if available (future backend response) */}
                  {chartData.annualStats.total_energy_potential_kWh !== undefined && (
                    <tr className={chartData.annualStats.max_power_kW !== undefined ? "bg-white" : "bg-gray-50"}>
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Total Energy Potential (kWh)
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        {chartData.annualStats.total_energy_potential_kWh.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  {chartData.annualStats.avg_power_output_kWh !== undefined && (
                    <tr className="bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Average Power Output (kWh)
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        {chartData.annualStats.avg_power_output_kWh.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  {chartData.annualStats.capacity_factor_percent !== undefined && (
                    <tr className="bg-white">
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Capacity Factor (%)
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        {chartData.annualStats.capacity_factor_percent.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  {chartData.annualStats.avg_wind_power_density_W_m2 !== undefined && (
                    <tr className="bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                        Average Wind Power Density (W/m²)
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        {chartData.annualStats.avg_wind_power_density_W_m2.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationModal;
