import React, { useMemo, useCallback } from "react";
import Card from "../../ui/Card";
import { useTranslation } from "react-i18next";
import { MonthValuePair } from "../assessmentUtils";
import SolarCharts from "../assessmentCharts/SolarCharts";
import DownloadResultsModal, { DownloadOption } from "../modals/DownloadResultsModal";

// Type definitions for solar assessment API response
export interface SolarAssessmentApiResponse {
  data?: {
    ghi?: MonthValuePair[];
    dni?: MonthValuePair[];
    output_power?: MonthValuePair[];
    output_power_hour?: Array<{
      datetime: string;
      powerKw: number;
      solarIrradiation: number;
      ambientTemperature: number;
      powerKwDust: number;
      solarIrradiationDust: number;
    }>;
    csv_link?: string | string[];
  };
  ghi?: MonthValuePair[];
  dni?: MonthValuePair[];
  output_power?: MonthValuePair[];
  output_power_hour?: Array<{
    datetime: string;
    powerKw: number;
    solarIrradiation: number;
    ambientTemperature: number;
    powerKwDust: number;
    solarIrradiationDust: number;
  }>;
  csv_link?: string | string[];
}

interface SolarDataResult {
  apiMonths: string[];
  ghi: number[];
  dni: number[];
  outputPower: number[];
}

interface SolarAssessmentResultsProps {
  data: SolarAssessmentApiResponse;
  onDownload?: () => void;
  isOnlyGroup1Filled?: boolean;
  isPremium?: boolean;
}

const SolarAssessmentResults: React.FC<SolarAssessmentResultsProps> = ({
  data,
  onDownload,
  isOnlyGroup1Filled,
  isPremium,
}) => {
  const { t } = useTranslation();

  // Helper function to extract data needed for charts
  const getSolarData = (): SolarDataResult => {
    if (!data) return { apiMonths: [], ghi: [], dni: [], outputPower: [] };

    // Check if data is nested or at the top level
    const solarData = data.data || data;

    // Extract GHI, DNI, and output_power data
    const ghiData = solarData.ghi || [];
    const dniData = solarData.dni || [];
    const outputPowerData = solarData.output_power || [];

    // Extract month names from the data
    const apiMonths = ghiData.map((item) => item.month);

    // Extract values
    const ghi = ghiData.map((item) => item.value);
    const dni = dniData.map((item) => item.value);
    const outputPower = outputPowerData.map((item) => item.value);

    return { apiMonths, ghi, dni, outputPower };
  };

  // Get the time-based power data in the format needed by SolarCharts
  const getTimeBasedPowerData = useCallback(() => {
    if (!data) return []; // Return empty array if no data

    // Check if data is nested or at the top level
    const solarData = data.data || data;

    // Extract hourly output power data
    const hourlyData = solarData.output_power_hour || [];

    // If no hourly data is available, return empty arrays
    if (hourlyData.length === 0) {
      return [];
    }
    
    // Format the data into the structure expected by SolarCharts
    // Map 'powerKw' to 'value'
    const formattedData = hourlyData.map((item: { datetime: string; powerKw: number }) => ({
      datetime: item.datetime,
      value: item.powerKw, // Map powerKw to value
    }));

    return formattedData;
  }, [data]);

  // Get the solar data
  const solarData = getSolarData();
  
  // Get the time-based power data using useMemo
  const timeBasedPowerData = useMemo(() => getTimeBasedPowerData(), [getTimeBasedPowerData]);

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
    return csvLinks.map((url) => {
      // Extract time granularity from URL
      let label = t("assessment.results.downloadCSV", "DOWNLOAD CSV");

      if (url.includes("15minute")) {
        label = t("assessment.results.download15Min", "15-Minute Resolution");
      } else if (url.includes("1minute")) {
        label = t("assessment.results.download1Min", "1-Minute Resolution");
      } else if (url.includes("1hour")) {
        label = t("assessment.results.download1Hour", "Hourly Resolution");
      } else if (url.includes("1day")) {
        label = t("assessment.results.download1Day", "Daily Resolution");
      } else if (url.includes("1month")) {
        label = t("assessment.results.download1Month", "Monthly Resolution");
      }

      return { label, url };
    });
  };

  // Basic layout: Render only GHI/DNI if only group 1 was filled
  if (isOnlyGroup1Filled) { 
    return (
      <div className="mt-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-14">
              <h2 className="text-xl font-bold">
                {t("assessment.results.solarRadiation", "Monthly Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI)")}
              </h2>
              <DownloadResultsModal
                csvLinks={getCsvLinks()}
                formatDownloadOptions={formatDownloadOptions}
                onDownload={onDownload}
                className="mb-0"
              />
            </div>
            <div className="w-full">
              <SolarCharts
                ghiData={solarData.ghi}
                dniData={solarData.dni}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Premium layout: Render both charts if group 1 was NOT the only one filled
  return (
    <div className="mt-8">
      <Card>
        <div className="p-6">
          {/* Top section: Always show Download Button at top right */}
          {/* <div className="mb-8 flex justify-end">
            <DownloadResultsModal
              csvLinks={getCsvLinks()}
              formatDownloadOptions={formatDownloadOptions}
              onDownload={onDownload}
            />
          </div> */}

          {/* Always show GHI and DNI charts */}
          <div>
            <div className="flex items-center justify-between mb-14">
              <h2 className="text-xl font-bold">
                {t("assessment.results.solarRadiation", "Monthly Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI)")}
              </h2>
              <DownloadResultsModal
                csvLinks={getCsvLinks()}
                formatDownloadOptions={formatDownloadOptions}
                onDownload={onDownload}
                className="mb-0"
              />
            </div>
            <SolarCharts
              ghiData={solarData.ghi}
              dniData={solarData.dni}
            />
          </div>

          {/* Add Output Power Over Time chart if hourly data is available */}
          {timeBasedPowerData.length > 0 && (
            // Condition is met if length > 0
            <div className="mt-12">
              <div className="flex items-center justify-between mb-14">
                <h2 className="text-xl font-bold">
                  {t("assessment.about.chart.solar.outputPower.title", "Output Power Over Time")}
                </h2>
                <DownloadResultsModal
                  csvLinks={getCsvLinks()}
                  formatDownloadOptions={formatDownloadOptions}
                  onDownload={onDownload}
                  className="mb-0"
                />
              </div>
              
              {/* <div className="flex justify-end mb-6">
                <h4 className="text-sm text-gray-800 italic">
                  Data source: CAMS Solar Radiation Timeseries.
                </h4>
              </div> */}
              
              <div className="w-full">
                <SolarCharts 
                  ghiData={[]}
                  dniData={[]}
                  powerOutputData={timeBasedPowerData}
                  showTimeBasedChart={isPremium}
                  showOnlyOutputPower={true}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SolarAssessmentResults;
