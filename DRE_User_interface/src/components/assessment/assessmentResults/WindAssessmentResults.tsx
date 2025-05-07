import React from "react";
import Card from "../../ui/Card";
import { useTranslation } from "react-i18next";
import { MonthValuePair, useMonthUtils } from "../assessmentUtils";
import WindCharts from "../assessmentCharts/WindCharts";
import DownloadResultsModal, { DownloadOption } from "../modals/DownloadResultsModal";

// Type definitions for wind assessment API response
export interface WindAssessmentApiResponse {
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
    output_power?: MonthValuePair[];
  };
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
}

// Define the structure for wind data
interface WindDataResult {
  apiMonths: string[];
  windSpeed: number[];
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
  outputPower?: number[];
  hasPowerOutput: boolean;
}

interface WindAssessmentResultsProps {
  data: WindAssessmentApiResponse;
  startDate?: string;
  endDate?: string;
  onDownload?: () => void;
  isPremium?: boolean;
}

const WindAssessmentResults: React.FC<WindAssessmentResultsProps> = ({
  data,
  startDate,
  endDate,
  onDownload,
  isPremium = false,
}) => {
  const { t } = useTranslation();
  const { parseDateRange } = useMonthUtils();

  // Get the CSV links from the API response
  const getCsvLinks = (): string[] => {
    const csvLink = data.data?.csv_link || data.csv_link;
    if (!csvLink) return [];
    
    return Array.isArray(csvLink) ? csvLink : [csvLink];
  };

  // Format download options with appropriate labels
  const formatDownloadOptions = (csvLinks: string[]): DownloadOption[] => {
    // If there's only one link, return it with a generic label
    if (csvLinks.length === 1) {
      return [{ label: t("assessment.results.downloadCSV", "DOWNLOAD CSV"), url: csvLinks[0] }];
    }
    
    // For multiple links, create descriptive labels based on the URL
    return csvLinks.map(url => {
      // Extract time granularity from URL if present
      let label = t("assessment.results.downloadCSV", "DOWNLOAD CSV");
      
      if (url.includes("power_output")) {
        label = t("assessment.results.downloadPowerOutput", "Power Output Data");
      } else if (url.includes("wind_speed")) {
        label = t("assessment.results.downloadWindSpeed", "Wind Speed Data");
      }
      
      return { label, url };
    });
  };

  // Extract wind data from the API response
  const getWindData = (): WindDataResult => {
    if (!data)
      return {
        apiMonths: [],
        windSpeed: [],
        countWindSpeed: [],
        directionalStats: [],
        roseDiagram: { directions: [], windspeedrange: [] },
        outputPower: [],
        hasPowerOutput: false,
      };

    // Check if data is nested or at the top level
    const windData = data.data || data;

    // Extract wind speed data
    const windSpeedData = windData.windSpeed || [];

    // Extract month names from the data
    const apiMonths = windSpeedData.map((item) => item.month);

    // Extract values
    const windSpeed = windSpeedData.map((item) => item.value);

    // Extract histogram data
    const countWindSpeed = windData.count_wind_speed || [];

    // Extract directional statistics
    const directionalStats = windData.directiona_stat_output || [];

    // Extract rose diagram data
    const roseDiagram = windData.rose_diagram || {
      directions: [],
      windspeedrange: [],
    };

    // Extract power output data for premium assessments
    const outputPowerData = windData.output_power || [];
    const outputPower = outputPowerData.map((item) => item.value);
    const hasPowerOutput = outputPowerData.length > 0;

    return {
      apiMonths,
      windSpeed,
      countWindSpeed,
      directionalStats,
      roseDiagram,
      outputPower,
      hasPowerOutput,
    };
  };

  // Get the wind data
  const windData = getWindData();

  // Parse date range for potential future use
  parseDateRange(startDate, endDate);

  // Basic layout
  if (!isPremium) {
    return (
      <div className="mt-8">
        <Card>
          <div className="p-6">
            <div className="mb-4 flex justify-end">
              <DownloadResultsModal
                csvLinks={getCsvLinks()}
                formatDownloadOptions={formatDownloadOptions}
                onDownload={onDownload}
              />
            </div>
            <WindCharts
              countWindSpeed={windData.countWindSpeed}
              directionalStats={windData.directionalStats}
              roseDiagram={windData.roseDiagram}
            />
          </div>
        </Card>
      </div>
    );
  }

  // Premium layout
  return (
    <div className="mt-8">
      <Card>
        <div className="px-4 py-2">
          <div className=" flex justify-end">
            <DownloadResultsModal
              csvLinks={getCsvLinks()}
              formatDownloadOptions={formatDownloadOptions}
              onDownload={onDownload}
            />
          </div>

          {/* Main content section */}
          <div className="grid grid-cols-1 gap-8">
            {/* Wind Charts */}
            <div>
              <WindCharts
                countWindSpeed={windData.countWindSpeed}
                directionalStats={windData.directionalStats}
                roseDiagram={windData.roseDiagram}
                outputPower={windData.outputPower}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WindAssessmentResults;
