import React from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import { EChartsOption } from "echarts";
import { CallbackDataParams } from "echarts/types/dist/shared";

// Define interfaces for the data structure
interface WindSpeedCount {
  xvalue: number;
  yvalue: number;
}

interface DirectionalStat {
  direction: string;
  frequency: number;
  weibull_shape: number;
  weibull_scale: number;
  mean: number;
  nine_five: number;
  nine_seven: number;
  nine_nine: number;
}

// Define interface for annual statistics summary
interface AnnualStats {
  total_energy_potential_kWh: number;
  avg_power_output_kWh: number;
  capacity_factor_percent: number;
  avg_wind_power_density_W_m2: number;
  max_power_kW?: number; // Make this optional as it might not be in the new structure
}

interface WindSpeedRange {
  label: string;
  data: number[];
}

interface RoseDiagram {
  directions: string[];
  windspeedrange: WindSpeedRange[];
}

// Define interface for complex time-series data points
interface ComplexDataPoint {
  datetime: string; // Assuming string format, adjust if needed
  wind_speed_in_m_per_s: number;
  power_in_kW?: number; // Optional for now, as it's missing per memory
}

interface WindChartsProps {
  countWindSpeed: WindSpeedCount[];
  directionalStats: DirectionalStat[];
  roseDiagram: RoseDiagram;
  outputPower?: number[]; // Add outputPower prop for premium assessments
  complexData?: ComplexDataPoint[]; // Use the defined interface
  annualStats?: AnnualStats; // Add annual statistics summary data
  showDistribution?: boolean; // Control rendering of distribution chart
  showRose?: boolean; // Control rendering of rose chart
  showTable?: boolean; // Control rendering of table
  showAnnualStats?: boolean; // Control rendering of annual stats table
}

const WindCharts: React.FC<WindChartsProps> = ({
  countWindSpeed,
  directionalStats,
  roseDiagram,
  outputPower,
  complexData, // Destructure new prop
  annualStats, // Annual stats summary object
  showDistribution = true, // Default to true
  showRose = true, // Default to true
  showTable = true, // Default to true
  showAnnualStats = true, // Default to true
}) => {
  // Debug logs for annual stats
  console.log("WindCharts received annualStats:", annualStats);
  console.log("WindCharts showAnnualStats:", showAnnualStats);

  const { t } = useTranslation();

  // Prepare data for the histogram
  // We can use either the pre-calculated countWindSpeed or calculate from complex data
  const histogramData = complexData && complexData.length > 0 
    ? calculateHistogramFromComplex(complexData) 
    : countWindSpeed.map((item) => [
        item.xvalue + 0.5, // Center bar between integers (e.g., at 0.5 for bin 0)
        item.yvalue * 100,
      ]);
  
  // Function to calculate histogram data from complex data
  function calculateHistogramFromComplex(data: ComplexDataPoint[]): [number, number][] {
    const maxBin = 30; // Maximum wind speed bin
    const binCounts: { [key: number]: number } = {};
    
    // Initialize bins
    for (let i = 0; i <= maxBin; i++) {
      binCounts[i] = 0;
    }
    
    // Count occurrences in each bin
    data.forEach(point => {
      const speed = point.wind_speed_in_m_per_s;
      const bin = Math.floor(speed);
      
      if (bin >= 0 && bin <= maxBin) {
        binCounts[bin]++;
      }
    });
    
    // Calculate frequencies and format for chart
    const totalPoints = data.length;
    const result: [number, number][] = [];
    
    for (let bin = 0; bin <= maxBin; bin++) {
      // Calculate frequency as percentage and amplify by 100 for display
      const frequency = (binCounts[bin] / totalPoints) * 100;
      result.push([bin + 0.5, frequency]); // Center bar between integers
    }
    
    return result;
  }

  // Calculate Weibull parameters from the data
  const calculateWeibullParameters = () => {
    // If complex data is available, use it directly for more accurate Weibull parameters
    if (complexData && complexData.length > 0) {
      // Extract all wind speeds directly from complex data
      const windSpeeds = complexData.map(point => point.wind_speed_in_m_per_s);
      
      // Calculate mean
      const sum = windSpeeds.reduce((acc, speed) => acc + speed, 0);
      const mean = sum / windSpeeds.length;
      
      // Calculate variance and standard deviation
      const squaredDiffs = windSpeeds.map(speed => Math.pow(speed - mean, 2));
      const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / windSpeeds.length;
      const stdDev = Math.sqrt(variance);
      
      // Estimate Weibull parameters using method of moments
      const cv = stdDev / mean; // Coefficient of variation
      const shape = Math.pow(cv, -1.086); // Approximation formula
      
      // For scale parameter (c), use the relationship with mean and gamma function
      const scale = mean / 0.9; // Approximation
      
      return { shape, scale };
    }
    
    // Fallback to using histogram data if complex data is not available
    if (histogramData.length === 0) return { shape: 2, scale: 8 }; // Default values

    // Extract wind speeds and their frequencies
    const speeds = histogramData.map((item) => item[0]);
    const frequencies = histogramData.map((item) => item[1]);
    
    // Calculate weighted mean
    let totalFrequency = 0;
    let weightedSum = 0;

    for (let i = 0; i < speeds.length; i++) {
      totalFrequency += frequencies[i];
      weightedSum += speeds[i] * frequencies[i];
    }

    const mean = totalFrequency > 0 ? weightedSum / totalFrequency : 0;

    // Calculate weighted variance
    let weightedSumSquaredDiff = 0;

    for (let i = 0; i < speeds.length; i++) {
      weightedSumSquaredDiff += frequencies[i] * Math.pow(speeds[i] - mean, 2);
    }

    const variance =
      totalFrequency > 0 ? weightedSumSquaredDiff / totalFrequency : 1;
    const stdDev = Math.sqrt(variance);

    // Estimate Weibull parameters
    // For simplicity, we'll use the method of moments estimation
    // k (shape) ≈ (stdDev / mean)^-1.086
    // c (scale) ≈ mean / Γ(1 + 1/k)

    // Approximation of shape parameter
    const shape = Math.pow(stdDev / mean, -1.086);

    // Gamma function approximation for Γ(1 + 1/k)
    const gamma = 1 - 0.5748646 / Math.pow(shape, 0.9513);

    // Scale parameter
    const scale = mean / gamma;

    return {
      shape: shape > 0 ? shape : 2, // Ensure positive shape
      scale: scale > 0 ? scale : 8, // Ensure positive scale
    };
  };

  // Generate Weibull distribution curve
  const generateWeibullCurve = () => {
    const { shape, scale } = calculateWeibullParameters();

    // Find max frequency for scaling
    const maxFrequency = Math.max(...histogramData.map((item) => item[1]));

    // Generate curve points
    const curvePoints = [];
    const maxX = 30; // Match the x-axis max
    const step = 0.1;

    for (let x = 0; x <= maxX; x += step) {
      // Weibull PDF: (k/c) * (x/c)^(k-1) * exp(-(x/c)^k)
      const k = shape;
      const c = scale;

      if (x === 0 && k <= 1) {
        // Avoid division by zero or infinity
        curvePoints.push([x, 0]);
        continue;
      }

      const term1 = k / c;
      const term2 = Math.pow(x / c, k - 1);
      const term3 = Math.exp(-Math.pow(x / c, k));

      // Calculate PDF value and scale to match histogram height
      const pdfValue = term1 * term2 * term3;
      const scaledValue = pdfValue * maxFrequency * c; // Scale to match histogram

      curvePoints.push([x, scaledValue]);
    }

    return curvePoints;
  };

  const weibullCurveData = generateWeibullCurve();

  // We'll calculate Mean Annual Energy data in the calculateMeanAnnualEnergy function below

  // Calculate Mean Annual Energy (MAE)
  const calculateMeanAnnualEnergy = (complexData: ComplexDataPoint[]) => {
    if (!complexData || complexData.length === 0) {
      return [];
    }
    
    // Check if this is a premium assessment (has power_in_kW data)
    const hasPowerData = complexData.some(point => point.power_in_kW != null);
    if (!hasPowerData) {
      return []; // Return empty array for basic assessments
    }

    const maxWindSpeedBin = 30;
    const powerSumPerBin: { [key: number]: number } = {};
    const hoursPerBin: { [key: number]: number } = {}; // Assuming 1 hour per data point

    for (let i = 0; i <= maxWindSpeedBin; i++) {
      powerSumPerBin[i] = 0;
      hoursPerBin[i] = 0;
    }

    // Filter out points without power data
    const validPoints = complexData.filter(point => point.power_in_kW != null);
    const totalHours = validPoints.length; // Only count points with valid power data

    // Avoid division by zero if all points filtered out
    if (totalHours === 0) {
      return [];
    }

    validPoints.forEach((point) => {
      const speed = point.wind_speed_in_m_per_s;
      // TypeScript non-null assertion operator (!) is safe here because we filtered the array
      const power = point.power_in_kW!; 
      const bin = Math.floor(speed);

      if (bin >= 0 && bin <= maxWindSpeedBin) {
        powerSumPerBin[bin] += power;
        hoursPerBin[bin] += 1; // Increment hour count for the bin
      }
    });

    const maeData = [];
    for (let bin = 0; bin <= maxWindSpeedBin; bin++) {
      // Calculate average power for the bin based on total valid points
      const averagePowerInBin = powerSumPerBin[bin] / totalHours;
      const mae = averagePowerInBin * 8760; // Annualize (kW to kWh/year)
      // Use the integer bin for plotting, aligns with histogram bars
      if (hoursPerBin[bin] > 0) { // Only include bins that have data
        maeData.push([bin, mae]);
      }
    }

    return maeData;
  };

  const meanAnnualEnergyData = calculateMeanAnnualEnergy(complexData || []); // Provide default empty array

  // Prepare options for the histogram chart
  const histogramOptions: EChartsOption = {
    title: {
      text: t("assessment.wind.histogram.title", "Wind Speed Distribution"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
        const paramsArray = Array.isArray(params) ? params : [params];
        
        if (paramsArray.length === 0) {
          return ''; // No data to show
        }

        // Get the hovered axis value (X-coordinate) from the first param's value array
        const pointValue = paramsArray[0].value;
        const axisValue = Array.isArray(pointValue) ? pointValue[0] : null;
        
        // Fallback if value isn't an array or axisValue couldn't be determined
        if (axisValue === null) {
          // Maybe try axisValue as a fallback? Or just return basic tooltip?
          // For now, return empty to indicate an issue.
          console.error("Could not determine axis value from tooltip params:", paramsArray);
          return ''; 
        }

        let numericAxisValue = 0;
        if (typeof axisValue === 'number') {
          numericAxisValue = axisValue;
        } else if (typeof axisValue === 'string') {
          numericAxisValue = parseFloat(axisValue);
          if (isNaN(numericAxisValue)) numericAxisValue = 0;
        }

        // Calculate the corresponding integer wind speed bin
        const windSpeedBin = Math.floor(numericAxisValue);

        // --- Manual Data Lookup ---

        // Find Histogram Data (x-value is bin + 0.5)
        const histogramEntry = histogramData.find(entry => entry[0] === windSpeedBin + 0.5);
        const histogramCount = histogramEntry ? Math.round(histogramEntry[1] / 100) : null; // Unscale the count

        // Find MAE Data (x-value is the bin integer), only if complexData exists
        let maeValue: number | null = null;
        if (complexData) {
          const maeEntry = meanAnnualEnergyData.find(entry => entry[0] === windSpeedBin);
          maeValue = maeEntry ? Math.round(maeEntry[1]) : null;
        }

        // --- Build Tooltip String ---

        let tooltip = `${t("assessment.wind.histogram.speed", "Wind Speed")}: ${windSpeedBin.toFixed(1)} m/s<br/>`;

        if (histogramCount !== null) {
          tooltip += `${t("assessment.wind.histogram.count", "Count")}: ${histogramCount}<br/>`;
        }
        
        if (complexData && maeValue !== null) {
          tooltip += `${t("assessment.wind.mae", "Mean Annual Energy")}: ${maeValue.toLocaleString()} kWh<br/>`;
        }

        // Optional: You could still show the Weibull curve's value if needed
        // const weibullParam = paramsArray.find(p => p.seriesName === 'Weibull Fit');
        // if (weibullParam && typeof weibullParam.value === 'object' && weibullParam.value !== null) {
        //   const weibullYValue = weibullParam.value[1];
        //   if (typeof weibullYValue === 'number') { 
        //     tooltip += `Weibull Scaled Value: ${weibullYValue.toFixed(2)}<br/>`;
        //   }
        // }

        return tooltip;
      },
    },
    grid: {
      left: "5%",
      right: "5%", // Increased right margin for second y-axis
      bottom: "12%",
      top: "15%",
      containLabel: true,
    },
    legend: {
      data: [
        t("assessment.wind.histogram.legend.histogram", "Wind Speed Histogram"),
        t("assessment.wind.histogram.legend.weibull", "Weibull Fit"),
        ...(complexData && complexData.length > 0
          ? [t("assessment.wind.histogram.legend.mae", "Mean Annual Energy (kWh)")]
          : []),
      ],
      bottom: -5,
      itemGap: 100,
    },
    xAxis: {
      type: "value" as const,
      name: t("assessment.wind.histogram.xaxis", "Wind Speed (m/s)"),
      nameLocation: "middle" as const,
      nameGap: 20,
      min: 0,
      max: 30,
      splitLine: {
        show: true,
        lineStyle: {
          type: "solid",
          color: "#E0E0E0",
        },
      },
      axisLine: {
        show: true,
      },
      axisTick: {
        show: true,
      },
    },
    yAxis: [
      {
        // Primary Y-Axis (Counts)
        type: "value" as const,
        name: t("assessment.wind.histogram.yaxis", "Number of Counts"),
        nameLocation: "middle" as const,
        nameGap: 50,
        min: 0,
        // max: 1400, // Let ECharts determine max based on data
        // interval: 200, // Let ECharts determine interval
        axisLabel: {
          formatter: (value: number) => Math.floor(value).toString(),
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "solid",
            color: "#E0E0E0",
          },
        },
        axisLine: {
          show: true,
        },
        axisTick: {
          show: true,
        },
      },
      ...(complexData && complexData.length > 0 && complexData.some(point => point.power_in_kW != null)
        ? [
            {
              // Secondary Y-Axis (Mean Annual Energy)
              type: "value" as const,
              name: t("assessment.wind.maeAxis", "Mean Annual Energy (kWh)"),
              nameLocation: "middle" as const,
              nameGap: 110,
              min: 0,
              position: "right" as const, // Ensure 'right' is typed correctly
              axisLabel: {
                formatter: (value: number) =>
                  `${Math.round(value).toLocaleString()} kWh`,
              },
              splitLine: { show: false }, // Don't show grid lines for second axis
              axisLine: {
                show: true,
              },
              axisTick: {
                show: true,
              },
            },
          ]
        : []),
    ],
    series: [
      {
        name: "Wind Speed Histogram",
        data: histogramData,
        type: "bar" as const,
        barWidth: "50%", // Changed from 80% to 50%
        barCategoryGap: "20%",
        itemStyle: {
          color: "#4DD0E1",
        },
        z: 1,
      },
      // Always include Weibull Fit series
      {
        name: "Weibull Fit",
        data: weibullCurveData,
        type: "line" as const,
        smooth: true,
        symbol: "none" as const,
        lineStyle: {
          color: "#E53935",
          width: 2,
        },
        z: 2,
      },
      // Conditionally add Mean Annual Energy series - only when power_in_kW data is available (premium)
      ...(complexData && complexData.length > 0 && complexData.some(point => point.power_in_kW != null)
        ? [
            {
              name: "Mean Annual Energy (kWh)",
              data: meanAnnualEnergyData,
              type: "scatter" as const,
              yAxisIndex: 1, // Link to the second y-axis (will only exist if power data is present)
              symbol: "circle" as const,
              symbolSize: 16,
              itemStyle: {
                color: "#FFA726",
              },
              z: 3,
            },
          ]
        : []),
    ],
  };

  // Prepare data for the wind rose chart
  const roseSeriesData = roseDiagram.windspeedrange.map((range, index) => {
    // Define colors for different wind speed ranges with exact hex values provided
    // Colors from center to perimeter
    const colors = [
      "#e5f5e0",
      "#d2edcc",
      "#90d4bd",
      "#64bfca",
      "#3fa3ca",
      "#1c80b7",
      "#3879b1",
    ];

    return {
      name: range.label,
      type: "bar" as const,
      coordinateSystem: "polar" as const,
      data: range.data,
      stack: "stack",
      itemStyle: {
        color: colors[index % colors.length],
      },
    };
  });

  // Prepare options for the wind rose chart
  const roseOptions: EChartsOption = {
    title: {
      text: t("assessment.wind.rose.title", "Wind Rose"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: roseDiagram.windspeedrange.map((range) => range.label),
      bottom: 0,
    },
    polar: {
      radius: "70%",
    },
    angleAxis: {
      type: "category" as const,
      data: roseDiagram.directions,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#ddd",
        },
      },
      axisLine: {
        show: false,
      },
    },
    radiusAxis: {
      type: "value" as const,
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    series: roseSeriesData,
  };

  // Check if we have power output data
  const hasPowerOutput = outputPower && outputPower.length > 0;

  // Add a new function to create the power output chart options
  const getPowerOutputOptions = (): EChartsOption => {
    // Generate month labels (Jan, Feb, etc.)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Use the outputPower data or an empty array if not available
    const powerData = outputPower || [];

    return {
      tooltip: {
        trigger: "axis",
        formatter: "{b}: {c} kW",
      },
      xAxis: {
        type: "category",
        data: months.slice(0, powerData.length),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        name: "Power (kW)",
        nameLocation: "middle",
        nameGap: 50,
      },
      series: [
        {
          name: "Power Output",
          type: "bar",
          data: powerData,
          itemStyle: {
            color: "#1e88e5",
          },
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {hasPowerOutput && (
        <div className="col-span-1 md:col-span-2">
          <h3 className="mb-1 text-lg font-medium">
            {t("assessment.wind.powerOutput", "Power Output")}
          </h3>
          <ReactECharts
            option={getPowerOutputOptions()}
            style={{ height: "400px" }}
          />
        </div>
      )}

      {/* Histogram Chart (Conditionally render) */}
      {showDistribution && (
        <div className="h-full w-full">
          <ReactECharts
            option={histogramOptions}
            style={{ height: "400px" }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      )}

      {/* Wind Rose Chart (Conditionally render) */}
      {showRose && (
        <div className="h-full w-full">
          <ReactECharts
            option={roseOptions}
            style={{ height: "400px" }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      )}

      {/* Directional Statistics Table (Conditionally render) */}
      {showTable && (
        <div className="col-span-1 overflow-x-auto md:col-span-2">
          <h3 className="mb-4 text-lg font-medium">
            {t("assessment.wind.table.title", "Directional Statistic Outputs")}
          </h3>
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.direction", "Direction")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.frequency", "Frequency (%)")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.weibull_shape", "Weibull Shape")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.weibull_scale", "Weibull Scale")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.mean", "Mean")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.95p", "95%p")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.97p", "97%p")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.99p", "99%p")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {directionalStats.map((stat, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                    {stat.direction}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {(stat.frequency).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.weibull_shape.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.weibull_scale.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.mean.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.nine_five.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.nine_seven.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {stat.nine_nine.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Annual Statistics Summary Table */}
      {showAnnualStats && annualStats && (
        <div className="col-span-1 overflow-x-auto md:col-span-2 mt-8">
          {/* Debug info */}
          {/* <div className="text-xs text-gray-500 mb-2">
            Debug: Annual stats available: {JSON.stringify(!!annualStats)}
          </div> */}
          <h3 className="mb-4 text-lg font-medium">
            {t("assessment.wind.table.annual_title", "Annual Energy Statistics")}
          </h3>
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.metric", "Metric")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("assessment.wind.table.value", "Value")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr className="bg-white">
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {t("assessment.wind.table.total_energy", "Total Energy Potential")}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {annualStats.total_energy_potential_kWh.toFixed(2)} kWh
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {t("assessment.wind.table.avg_power", "Average Power Output")}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {annualStats.avg_power_output_kWh.toFixed(2)} kWh
                </td>
              </tr>
              <tr className="bg-white">
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {t("assessment.wind.table.capacity_factor", "Capacity Factor")}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {annualStats.capacity_factor_percent.toFixed(2)}%
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                  {t("assessment.wind.table.wind_power_density", "Average Wind Power Density")}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                  {annualStats.avg_wind_power_density_W_m2.toFixed(2)} W/m²
                </td>
              </tr>
              {annualStats.max_power_kW !== undefined && (
                <tr className="bg-white">
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                    {t("assessment.wind.table.max_power", "Maximum Power")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                    {annualStats.max_power_kW.toFixed(2)} kW
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WindCharts;
