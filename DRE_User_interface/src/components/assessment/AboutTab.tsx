import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import solarImage from "../../assets/solar-panels.png";
import windImage from "../../assets/wind-turbines.png";
import { useTranslation } from "react-i18next";
import { useSolarAbout, useWindAbout } from "../../hooks/query";
import WindCharts from "./assessmentCharts/WindCharts";
import SolarCharts from "./assessmentCharts/SolarCharts";
import { MonthValuePair } from "./assessmentUtils";
import { useAuth } from "../../hooks/useAuth";
import {
  SolarAboutDescription,
  WindAboutDescription,
  SolarAboutUsecase,
  WindAboutUsecase,
  WindBasicDescription,
  WindPremiumDescription,
  SolarBasicDescription,
  SolarPremiumDescription
} from "./text/AssessmentAboutText";

// Define type for API response data to avoid using any
interface ApiResponseData {
  ghi?: MonthValuePair[];
  dni?: MonthValuePair[];
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
  annual_stats?: {
    // Support both old and new field names for backward compatibility
    total_energy_potential_kwh?: number;
    annual_avg_power_kwh?: number;
    annual_avg_capacity_factor_percent?: number;
    annual_avg_wind_speed_m_s?: number;
    annual_avg_wind_power_density_w_m2?: number;
    
    // New field names
    total_energy_potential_kWh?: number;
    avg_power_output_kWh?: number;
    capacity_factor_percent?: number;
    avg_wind_power_density_W_m2?: number;
    
    // Common to both old and new
    max_power_kW?: number;
  };
  api_description?: string;
  data?: ApiResponseData; // Handle nested data possibility
  complex?: ComplexDataPoint[]; // Correct field for complex data
  power_output?: PowerOutputDataPoint[]; // Add power_output field
  csv_link?: string[]; // Added based on user provided API response
}

interface ComplexDataPoint {
  datetime: string;
  wind_speed_in_m_per_s: number;
  power_in_kW?: number; // Optional per memory
}

interface PowerOutputDataPoint {
  datetime: string;
  value: number;
}

interface AboutTabProps {
  energyType?: "solar" | "wind";
}

// Define WindChartData interface to match the structure expected by WindCharts component
interface WindChartData {
  countWindSpeed: Array<{ xvalue: number; yvalue: number }>;
  directionalStats: Array<{
    direction: string;
    frequency: number;
    weibull_shape: number;
    weibull_scale: number;
    mean: number;
    nine_five: number;
    nine_seven: number;
    nine_nine: number;
  }>;
  roseDiagram: {
    directions: string[];
    windspeedrange: Array<{
      label: string;
      data: number[];
    }>;
  };
  complexData?: ComplexDataPoint[]; // Use defined interface
  annualStats?: {
    total_energy_potential_kWh: number;
    avg_power_output_kWh: number;
    capacity_factor_percent: number;
    avg_wind_power_density_W_m2: number;
    max_power_kW?: number;
  };
}

const AboutTab = ({ energyType = "solar" }: AboutTabProps): React.ReactNode => {
  const { t } = useTranslation();
  const { isAuthenticated, apiInitialized } = useAuth();
  const [ghiData, setGhiData] = useState<number[]>([]);
  const [dniData, setDniData] = useState<number[]>([]);
  const [powerOutputData, setPowerOutputData] = useState<PowerOutputDataPoint[]>([]);
  const [windChartData, setWindChartData] = useState<WindChartData>({
    countWindSpeed: [],
    directionalStats: [],
    roseDiagram: { directions: [], windspeedrange: [] },
    complexData: [], // Initialize complexData
  });

  // Always use solar as default if energyType is undefined or invalid
  const effectiveEnergyType =
    energyType === "solar" || energyType === "wind" ? energyType : "solar";

  // Fetch about data based on energy type
  const solarAboutQuery = useSolarAbout();
  const windAboutQuery = useWindAbout();

  // Get the appropriate query based on energy type
  const activeQuery =
    effectiveEnergyType === "solar" ? solarAboutQuery : windAboutQuery;

  const getSectionDescription = () => {
    if (effectiveEnergyType === "solar") {
      return <SolarAboutDescription />;
    } else {
      return <WindAboutDescription />;
    }
  };

  const getUseCaseDesc = () => {
    if (effectiveEnergyType === "solar") {
      return <SolarAboutUsecase />;
    } else {
      return <WindAboutUsecase />;
    }
  };

  // Process the API response data
  useEffect(() => {
    if (activeQuery.data) {
      try {
        // Determine the source of data (direct or nested under 'data' key)
        const rawData = activeQuery.data as ApiResponseData;
        const data = rawData.data || rawData;

        if (effectiveEnergyType === "solar") {
          // Extract GHI, DNI, and Power Output data
          const ghi = data.ghi || [];
          const dni = data.dni || [];
          const powerOutput = data.power_output || [];

          // Set GHI data
          if (Array.isArray(ghi) && ghi.length > 0) {
            setGhiData(
              ghi.map((item) =>
                typeof item.value === "number" ? item.value : 0,
              ),
            );
          } else {
            setGhiData([]);
          }

          // Set DNI data
          if (Array.isArray(dni) && dni.length > 0) {
            setDniData(
              dni.map((item) =>
                typeof item.value === "number" ? item.value : 0,
              ),
            );
          } else {
            setDniData([]);
          }

          // Set power output data
          if (Array.isArray(powerOutput)) {
            setPowerOutputData(powerOutput);
          } else {
            setPowerOutputData([]);
          }

          // Clear wind data when switching to solar
          setWindChartData({
            countWindSpeed: [],
            directionalStats: [],
            roseDiagram: { directions: [], windspeedrange: [] },
            complexData: [],
          });
        } else {
          // For wind, we need wind data
          // Extract wind chart data - make sure to check both top-level and nested data

          // Log the data structure to help debug
          console.log("Wind data structure:", data);
          console.log("Annual stats data:", data.annual_stats);
          console.log("Annual stats type:", typeof data.annual_stats);

          // Transform annual_stats to match the new interface structure
          const transformedAnnualStats = data.annual_stats ? {
            total_energy_potential_kWh: data.annual_stats.total_energy_potential_kwh || data.annual_stats.total_energy_potential_kWh || 0,
            avg_power_output_kWh: data.annual_stats.annual_avg_power_kwh || data.annual_stats.avg_power_output_kWh || 0,
            capacity_factor_percent: data.annual_stats.annual_avg_capacity_factor_percent || data.annual_stats.capacity_factor_percent || 0,
            avg_wind_power_density_W_m2: data.annual_stats.annual_avg_wind_power_density_w_m2 || data.annual_stats.avg_wind_power_density_W_m2 || 0,
            max_power_kW: data.annual_stats.max_power_kW,
          } : undefined;
          
          setWindChartData({
            countWindSpeed: data.count_wind_speed || [],
            directionalStats: data.directiona_stat_output || [],
            roseDiagram: data.rose_diagram || {
              directions: [],
              windspeedrange: [],
            },
            complexData: data.complex || [], // Correct mapping from 'complex'
            annualStats: transformedAnnualStats, // Use transformed annual stats data
          });

          // Clear solar data when switching to wind
          setGhiData([]);
          setDniData([]);
          setPowerOutputData([]);
        }
      } catch (error) {
        console.error("Error processing API response:", error);
        // If error processing data, set empty chart data
        setGhiData([]);
        setDniData([]);
        setPowerOutputData([]); // Reset power output data on error
        setWindChartData({
          countWindSpeed: [],
          directionalStats: [],
          roseDiagram: { directions: [], windspeedrange: [] },
          complexData: [],
        });
      }
    } else {
      // Clear all data if query.data is null/undefined (e.g., after invalidation)
      setGhiData([]);
      setDniData([]);
      setPowerOutputData([]);
      setWindChartData({
        countWindSpeed: [],
        directionalStats: [],
        roseDiagram: { directions: [], windspeedrange: [] },
        complexData: [],
      });
    }
  }, [activeQuery.data, effectiveEnergyType]);

  // Handle authentication not ready state
  if (!isAuthenticated || !apiInitialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">
          {t("assessment.common.authenticating", "Authenticating...")}
        </p>
      </div>
    );
  }

  // Handle loading state
  if (activeQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">
          {t("assessment.common.loading", "Loading...")}
        </p>
      </div>
    );
  }

  // Handle error state
  if (activeQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">
          {t(
            "assessment.common.error.fetchFailed",
            "Failed to fetch data. Please try again later.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12" key={`about-tab-${effectiveEnergyType}`}>
      <Card>
        <div className="flex flex-col md:flex-row">
          <div className="mx-4 flex flex-1 flex-col justify-center py-6 pr-6">
            <h2 className="mb-4 text-3xl font-bold">
              {effectiveEnergyType === "solar"
                ? t(
                    "assessment.about.solar.title",
                    "Solar Radiation & Power Production Assessment",
                  )
                : t(
                    "assessment.about.wind.title",
                    "Wind Speed & Power Production Assessment",
                  )}
            </h2>
            <div className="text-lg text-gray-600">
              {getSectionDescription()}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="my-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              src={effectiveEnergyType === "solar" ? solarImage : windImage}
              alt={
                effectiveEnergyType === "solar"
                  ? t("assessment.about.image.solar.alt", "Solar panels")
                  : t("assessment.about.image.wind.alt", "Wind turbines")
              }
              className="h-64 w-full rounded-md object-cover"
            />
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-medium">
              <strong>
                {t(
                  "assessment.about.serviceDetails.title",
                  "Use Case Demonstration",
                )}
              </strong>
            </h2>
            <div className="text-lg text-gray-600">{getUseCaseDesc()}</div>
          </div>
        </div>

        <div className="mb-16 mt-24">
          <h2 className="mb-4 text-2xl font-bold">Basic</h2>
          {effectiveEnergyType === "solar"
          ? <SolarBasicDescription />
         : <WindBasicDescription />}
        </div>

        <div className="mb-12">
          <h3 className="mb-2 text-lg font-medium">
            {effectiveEnergyType === "solar"
              ? t(
                  "assessment.about.chart.solar.title",
                  "Monthly Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI)",
                )
              : t("assessment.about.chart.wind.title", "Wind Resource Data")}
          </h3>

          <div className="mb-6 flex justify-end">
            <h4 className="text-sm italic text-gray-800">
              {effectiveEnergyType === "solar"
                ? "Data source: CAMS Solar Radiation Data Service."
                : "Data source: ERA5 Reanalysis."}
            </h4>
          </div>

          {/* Charts section */}
          <div className="space-y-8">
            {effectiveEnergyType === "solar" && (
              <div className="mt-6">
                <SolarCharts
                  ghiData={ghiData}
                  dniData={dniData}
                  powerOutputData={powerOutputData}
                  showOnlyOutputPower={false}
                  showTimeBasedChart={false}
                />
              </div>
            )}
            {effectiveEnergyType === "wind" && (
              <div className="space-y-8">
                {/* Debug info */}
                {/* <div className="text-xs text-gray-500 mb-2">
                  Debug: Annual stats available (Basic): {JSON.stringify(!!windChartData.annualStats)}
                </div> */}
                {windChartData.countWindSpeed.length > 0 && (
                  <WindCharts
                    countWindSpeed={windChartData.countWindSpeed}
                    directionalStats={windChartData.directionalStats}
                    roseDiagram={windChartData.roseDiagram}
                    complexData={
                      /* For basic section, create a copy of complexData with power_in_kW set to undefined */
                      (windChartData.complexData || []).map(point => ({
                        ...point,
                        power_in_kW: undefined // Force power_in_kW to be undefined in basic section
                      }))
                    }
                    annualStats={windChartData.annualStats}
                    showAnnualStats={false} /* Don't show annual stats in basic section */
                  />
                )}
              </div>
            )}
          </div>

          <div className="mb-28 mt-16">
            <h2 className="mb-4 text-2xl font-bold">Premium</h2>
            {effectiveEnergyType === "solar"
          ? <SolarPremiumDescription />
         : <WindPremiumDescription />}
            {/* TODO: Add Premium content */}

            <div className="my-16">
              {effectiveEnergyType === "wind" ? (
                // Render single WindCharts component like Basic section
                <div className="mt-6 space-y-8"> 
                  {/* Debug info */}
                  {/* <div className="text-xs text-gray-500 mb-2">
                    Debug: Annual stats available (Premium): {JSON.stringify(!!windChartData.annualStats)}
                  </div> */}
                  {(windChartData.countWindSpeed.length > 0 ||
                    windChartData.roseDiagram.directions.length > 0 ||
                    windChartData.directionalStats.length > 0) && (
                    <WindCharts
                      countWindSpeed={windChartData.countWindSpeed}
                      directionalStats={windChartData.directionalStats}
                      roseDiagram={windChartData.roseDiagram}
                      complexData={windChartData.complexData || []}
                      annualStats={windChartData.annualStats}
                      showAnnualStats={!!windChartData.annualStats}
                    />
                  )}
                </div>
              ) : (
                // Replace placeholder with actual SolarCharts rendering for premium
                effectiveEnergyType === "solar" && (
                  <div className="mt-6">
                    <SolarCharts
                      ghiData={ghiData}
                      dniData={dniData}
                      powerOutputData={powerOutputData}
                      showOnlyOutputPower={true}
                      showTimeBasedChart={true}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutTab;
