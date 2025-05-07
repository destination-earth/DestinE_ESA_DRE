import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";
import { useMonthUtils } from "../assessmentUtils";

// Interface for the power output data points passed from AboutTab
interface PowerOutputDataPoint {
  datetime: string;
  value: number;
}

interface SolarChartsProps {
  ghiData: number[];
  dniData: number[];
  powerOutputData?: PowerOutputDataPoint[]; // Use the new interface, make optional
  showOnlyOutputPower?: boolean;
  showTimeBasedChart?: boolean;
}

// Component for rendering solar charts (GHI, DNI, and Output Power)
const SolarCharts: React.FC<SolarChartsProps> = ({
  ghiData,
  dniData,
  powerOutputData = [], // Destructure the new prop with default empty array
  showOnlyOutputPower = false,
  showTimeBasedChart = false,
}) => {
  const { t } = useTranslation();
  const { getAllMonthsShort } = useMonthUtils();
  const allMonthsShort = getAllMonthsShort();

  // Calculate labels and values directly from props using useMemo
  const calculatedTimeData = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    if (showTimeBasedChart && powerOutputData && powerOutputData.length > 0) {
      powerOutputData.forEach((point) => {
        try {
          const date = new Date(point.datetime);
          const formattedTime = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
          labels.push(formattedTime);
          values.push(point.value);
        } catch (e) {
          console.error("Error parsing date:", point.datetime, e);
        }
      });
    }
    return { labels, values };
  }, [showTimeBasedChart, powerOutputData]); // Depend on props

  // Time-based output power chart options
  const timeBasedOutputPowerOptions: ApexOptions = {
    chart: {
      id: "power-line-chart",
      type: "bar", // Changed from line to bar to match the actual rendering
      height: 450,
      toolbar: {
        show: false,
      },
      stacked: false, // Match the setting from combinedSolarChartOptions
    },
    colors: ["#f97316"], // Same orange color as DNI in the first chart
    plotOptions: {
      bar: {
        columnWidth: "50%", // Match the setting from combinedSolarChartOptions
      },
    },
    fill: {
      opacity: 1, // Match the setting from combinedSolarChartOptions
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"], // Match the setting from combinedSolarChartOptions
    },
    dataLabels: {
      enabled: false, // Set to false to hide the values on bars
      formatter: function(val: string | number | number[]): string | number {
        // Handle different types that could be passed to the formatter
        if (typeof val === 'number') {
          return val.toFixed(1); // Format to 1 decimal place
        } else if (Array.isArray(val)) {
          // If it's an array, return the first element formatted (or empty string if empty)
          return val.length > 0 && typeof val[0] === 'number' ? val[0].toFixed(1) : '';
        } else {
          // If it's a string, return as is
          return val;
        }
      },
      style: {
        fontSize: '12px',
        colors: ['#000000'] // Black text for better visibility
      },
      offsetY: -20, // Adjust vertical position of labels
    },
    // Merged plotOptions with the one below

    xaxis: {
      categories: calculatedTimeData.labels, // Use calculated labels
      type: "category",
      title: {
        text: t("assessment.results.solar.timeTitle", "Time (dd-mm-HH)"),
      },
      labels: {
        rotate: 0,
        rotateAlways: true,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        maxHeight: 120,
        offsetY: 15,
        style: {
          fontSize: "12px",
          fontWeight: 800,
        },
      },
      tickAmount: 6, // Show only 6 ticks on the x-axis
    },
    yaxis: {
      title: {
        text: t("assessment.results.solar.outputPowerUnit", "kW"),
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(2);
        },
      },
    },
    // Removed duplicate stroke property
    markers: {
      size: 4,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2) + " kW";
        },
      },
    },
  };

  // Chart options for combined GHI and DNI chart
  const combinedSolarChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350, // Adjusted height
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        columnWidth: "70%",
        dataLabels: {
          position: "top",
        },
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
        text: t("assessment.results.month", "Month"),
        style: {
          fontWeight: 400,
          fontSize: "18px",
        },
      },
    },
    yaxis: {
      title: {
        text: t(
          "assessment.results.irradiance",
          "Average Monthly Cumulative (variable) [kWh/m²]"
        ),
        style: {
          fontWeight: 400,
          fontSize: "16px",
        },
      },
      labels: {
        formatter: (val) => val.toFixed(2),
        style: {
          fontWeight: 400,
          fontSize: "13px",
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ["#3B82F6", "#f97316"], // Blue for GHI, Orange for DNI
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)} kWh/m²`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: 0,
        offsetY: 0,
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* GHI/DNI Chart - Render if not explicitly only showing power chart */}
      {!showOnlyOutputPower && ghiData.length > 0 && dniData.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-3 text-center text-lg font-semibold text-gray-700">
            {t(
              "assessment.results.solar.ghiDniChartTitle",
              "GHI and DNI Chart"
            )}
          </h3>
          <Chart
            options={combinedSolarChartOptions}
            series={[
              {
                name: t("assessment.results.ghi", "GHI"),
                data: ghiData,
              },
              {
                name: t("assessment.results.dni", "DNI"),
                data: dniData,
              },
            ]}
            type="bar"
            height={350}
            width="100%"
          />
        </div>
      )}

      {/* Time-Based Output Power Chart - Render if flag is set and data exists */}
      {showTimeBasedChart && calculatedTimeData.values.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-3 text-center text-lg font-semibold text-gray-700">
            {t("assessment.results.solar.timeBasedPowerChartTitle", "Time-Based Output Power Chart")}
          </h3>
          <Chart
            options={{
              ...timeBasedOutputPowerOptions,
              xaxis: {
                ...timeBasedOutputPowerOptions.xaxis,
                categories: calculatedTimeData.labels,
              },
              // Removed duplicate colors property to use the one from timeBasedOutputPowerOptions
              series: undefined, // Remove series from options as it's provided separately
            }}
            series={[
              {
                name: t("assessment.results.solar.outputPower", "Output Power"),
                data: calculatedTimeData.values,
              },
            ]}
            type="bar"
            height={450}
            width="100%"
          />
        </div>
      )}

      {/* Placeholder or message if no charts are displayed */}
      {showOnlyOutputPower && calculatedTimeData.values.length === 0 && (
        <div className="text-center text-gray-500">
          {t("assessment.results.solar.noPowerData", "Power output data is not available.")}
        </div>
      )}
      {!showOnlyOutputPower && ghiData.length === 0 && dniData.length === 0 && (
        <div className="text-center text-gray-500">
          {t("assessment.results.solar.noGhiDniData", "GHI/DNI data is not available.")}
        </div>
      )}
    </div>
  );
};

export default SolarCharts;
