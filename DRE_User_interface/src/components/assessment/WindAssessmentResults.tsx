import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { useTranslation } from "react-i18next";
import {  MonthValuePair, useMonthUtils } from "./assessmentUtils";

// Type definitions for wind assessment API response
export interface WindAssessmentApiResponse {
  data?: {
    windSpeed?: MonthValuePair[];
  };
  windSpeed?: MonthValuePair[];
}

interface WindDataResult {
  apiMonths: string[];
  windSpeed: number[];
}

interface WindAssessmentResultsProps {
  data: WindAssessmentApiResponse;
  startDate?: string;
  endDate?: string;
  onDownload?: () => void;
}

const WindAssessmentResults: React.FC<WindAssessmentResultsProps> = ({
  data,
  startDate,
  endDate,
  onDownload,
}) => {
  const { t } = useTranslation();
  const { 
    getMonthIndex, 
    parseDateRange, 
    isMonthInDateRange,
    getAllMonths,
    getAllMonthsShort
  } = useMonthUtils();

  // Extract wind data from the API response
  const getWindData = (): WindDataResult => {
    if (!data) return { apiMonths: [], windSpeed: [] };

    // Check if data is nested or at the top level
    const windData = data.data || data;
    
    // Extract wind speed data
    const windSpeedData = windData.windSpeed || [];
    
    // Extract month names from the data
    const apiMonths = windSpeedData.map(item => item.month);
    
    // Extract values
    const windSpeed = windSpeedData.map(item => item.value);
    
    return { apiMonths, windSpeed };
  };

  // Get the wind data
  const windData = getWindData();
  const dateRange = parseDateRange(startDate, endDate);
  
  // Create an array of all 12 months for the x-axis
  const allMonths = getAllMonths();
  const allMonthsShort = getAllMonthsShort();
  
  // Map API data to all 12 months, with zeros for months outside the date range
  const windSpeedData = allMonths.map((_, index) => {
    // Check if this month is within the date range
    if (!isMonthInDateRange(index, dateRange)) {
      return 0; // Month outside date range
    }
    
    // Find the corresponding month in the API data
    const apiMonthIndex = windData.apiMonths?.findIndex(month => {
      const monthIndex = getMonthIndex(month);
      return monthIndex === index;
    });
    
    return apiMonthIndex !== -1 && apiMonthIndex !== undefined ? windData.windSpeed[apiMonthIndex] : 0;
  });
  
  console.log("Wind data for all months:", { windSpeedData });
  console.log("Raw API response:", data);

  // Chart options for Wind Speed
  const windChartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: allMonthsShort,
      title: {
        text: t("assessment.results.wind.monthsTitle", "Months"),
      },
    },
    yaxis: {
      title: {
        text: t("assessment.results.wind.speedTitle", "Wind Speed (m/s)"),
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " m/s";
        },
      },
    },
    colors: ["#2196F3"],
    markers: {
      size: 5,
    },
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        {t("assessment.results.wind.title", "Wind Assessment Results")}
      </h2>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Wind Speed Chart */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">
              {t("assessment.results.wind.speedChart", "Average Wind Speed")}
            </h3>
            <Chart
              options={windChartOptions}
              series={[
                {
                  name: t("assessment.results.wind.speed", "Wind Speed"),
                  data: windSpeedData,
                },
              ]}
              type="line"
              height={350}
            />
          </div>
        </Card>
      </div>
      
      {/* Download Button */}
      {onDownload && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onDownload}>
          {/* <Button onClick={onDownload} variant="primary"> */}
            {t("assessment.results.downloadButton", "Download Results")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WindAssessmentResults;
