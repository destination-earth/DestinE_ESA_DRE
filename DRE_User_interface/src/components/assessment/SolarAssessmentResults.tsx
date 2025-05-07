import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { useTranslation } from "react-i18next";
import {  MonthValuePair, useMonthUtils } from "./assessmentUtils";

// Type definitions for solar assessment API response
export interface SolarAssessmentApiResponse {
  data?: {
    ghi?: MonthValuePair[];
    dni?: MonthValuePair[];
  };
  ghi?: MonthValuePair[];
  dni?: MonthValuePair[];
}

interface SolarDataResult {
  apiMonths: string[];
  ghi: number[];
  dni: number[];
}

interface SolarAssessmentResultsProps {
  data: SolarAssessmentApiResponse;
  startDate?: string;
  endDate?: string;
  onDownload?: () => void;
}

const SolarAssessmentResults: React.FC<SolarAssessmentResultsProps> = ({
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
    getAllMonthsShort,
  } = useMonthUtils();

  // Extract solar data from the API response
  const getSolarData = (): SolarDataResult => {
    if (!data) return { apiMonths: [], ghi: [], dni: [] };

    // Check if data is nested or at the top level
    const solarData = data.data || data;

    // Extract GHI and DNI data
    const ghiData = solarData.ghi || [];
    const dniData = solarData.dni || [];

    // Extract month names from the data
    const apiMonths = ghiData.map((item) => item.month);

    // Extract values
    const ghi = ghiData.map((item) => item.value);
    const dni = dniData.map((item) => item.value);

    return { apiMonths, ghi, dni };
  };

  // Get the solar data
  const solarData = getSolarData();
  const dateRange = parseDateRange(startDate, endDate);

  // Create an array of all 12 months for the x-axis
  const allMonths = getAllMonths();
  const allMonthsShort = getAllMonthsShort();

  // Map API data to all 12 months, with zeros for months outside the date range
  const ghiData = allMonths.map((_, index) => {
    // Check if this month is within the date range
    if (!isMonthInDateRange(index, dateRange)) {
      return 0; // Month outside date range
    }

    // Find the corresponding month in the API data
    const apiMonthIndex = solarData.apiMonths?.findIndex((month) => {
      const monthIndex = getMonthIndex(month);
      return monthIndex === index;
    });

    return apiMonthIndex !== -1 && apiMonthIndex !== undefined
      ? solarData.ghi[apiMonthIndex]
      : 0;
  });

  const dniData = allMonths.map((_, index) => {
    // Check if this month is within the date range
    if (!isMonthInDateRange(index, dateRange)) {
      return 0; // Month outside date range
    }

    // Find the corresponding month in the API data
    const apiMonthIndex = solarData.apiMonths?.findIndex((month) => {
      const monthIndex = getMonthIndex(month);
      return monthIndex === index;
    });

    return apiMonthIndex !== -1 && apiMonthIndex !== undefined
      ? solarData.dni[apiMonthIndex]
      : 0;
  });

  console.log("Solar data for all months:", { ghiData, dniData });
  console.log("Raw API response:", data);

  // Chart options for GHI
  const ghiChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: allMonthsShort,
      title: {
        text: t("assessment.results.solar.monthsTitle", "Months"),
      },
    },
    yaxis: {
      title: {
        text: t("assessment.results.solar.ghiTitle", "GHI (kWh/m²)"),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " kWh/m²";
        },
      },
    },
    colors: ["#4CAF50"],
  };

  // Chart options for DNI
  const dniChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: allMonthsShort,
      title: {
        text: t("assessment.results.solar.monthsTitle", "Months"),
      },
    },
    yaxis: {
      title: {
        text: t("assessment.results.solar.dniTitle", "DNI (kWh/m²)"),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " kWh/m²";
        },
      },
    },
    colors: ["#FF9800"],
  };

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">
        {t("assessment.results.solar.title", "Solar Assessment Results")}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* GHI Chart */}
        <Card>
          <div className="p-4">
            <h3 className="mb-2 text-lg font-medium">
              {t(
                "assessment.results.solar.ghiChart",
                "Global Horizontal Irradiance (GHI)",
              )}
            </h3>
            <Chart
              options={ghiChartOptions}
              series={[
                {
                  name: t("assessment.results.solar.ghi", "GHI"),
                  data: ghiData,
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </Card>

        {/* DNI Chart */}
        <Card>
          <div className="p-4">
            <h3 className="mb-2 text-lg font-medium">
              {t(
                "assessment.results.solar.dniChart",
                "Direct Normal Irradiance (DNI)",
              )}
            </h3>
            <Chart
              options={dniChartOptions}
              series={[
                {
                  name: t("assessment.results.solar.dni", "DNI"),
                  data: dniData,
                },
              ]}
              type="bar"
              height={350}
            />
          </div>
        </Card>
      </div>

      {/* Download Button */}
      {onDownload && (
        <div className="mt-6 flex justify-end">
          {/* <Button onClick={onDownload} variant="primary"> */}
          <Button onClick={onDownload}>
            {t("assessment.results.downloadButton", "Download Results")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolarAssessmentResults;
