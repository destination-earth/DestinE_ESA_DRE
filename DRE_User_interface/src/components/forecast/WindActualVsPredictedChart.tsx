import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getChartToolbarConfig } from '../../utils/svgIcons';
import { useTranslation } from "react-i18next";

export interface WindActualVsPredictedChartProps {
  isLoading?: boolean;
  labels?: string[];
  actualPowerData?: number[];
  forecastPowerData?: number[];
}

interface ChartDataItem {
  category: string;
  actualPower: number;
  forecastedPower: number;
}

const hardcodedChartData: ChartDataItem[] = [
  { category: 'Sun Nov 24 2024 00:00:00', forecastedPower: 527.1, actualPower: 455.1 },
  { category: 'Sun Nov 24 2024 01:00:00', forecastedPower: 3130.8, actualPower: 3125.2 },
  { category: 'Sun Nov 24 2024 02:00:00', forecastedPower: 3472.6, actualPower: 3350.8 },
  { category: 'Sun Nov 24 2024 03:00:00', forecastedPower: 3356.8, actualPower: 3420.3 },
  { category: 'Sun Nov 24 2024 04:00:00', forecastedPower: 3472.6, actualPower: 3280.5 },
  { category: 'Sun Nov 24 2024 05:00:00', forecastedPower: 3130.8, actualPower: 2950.2 },
  { category: 'Sun Nov 24 2024 06:00:00', forecastedPower: 609.0, actualPower: 1850.6 },
  { category: 'Sun Nov 24 2024 07:00:00', forecastedPower: 0.4, actualPower: 350.1 },
  { category: 'Sun Nov 24 2024 08:00:00', forecastedPower: 0.4, actualPower: 120.5 },
  { category: 'Sun Nov 24 2024 09:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 10:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 11:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 12:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 13:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 14:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 15:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 16:00:00', forecastedPower: 0.4, actualPower: 0.0 },
  { category: 'Sun Nov 24 2024 17:00:00', forecastedPower: 5.7, actualPower: 10.2 },
  { category: 'Sun Nov 24 2024 18:00:00', forecastedPower: 91.3, actualPower: 120.5 },
  { category: 'Sun Nov 24 2024 19:00:00', forecastedPower: 303.3, actualPower: 450.8 },
  { category: 'Sun Nov 24 2024 20:00:00', forecastedPower: 455.1, actualPower: 890.3 },
  { category: 'Sun Nov 24 2024 21:00:00', forecastedPower: 767.7, actualPower: 1250.6 },
  { category: 'Sun Nov 24 2024 22:00:00', forecastedPower: 1202.5, actualPower: 2085.5 },
  { category: 'Sun Nov 24 2024 23:00:00', forecastedPower: 1202.5, actualPower: 2085.5 }
];

const WindActualVsPredictedChart: React.FC<WindActualVsPredictedChartProps> = ({
  isLoading = false,
  labels,
  actualPowerData,
  forecastPowerData
}) => {
  const { t } = useTranslation();

  const usePropsData = labels && actualPowerData && forecastPowerData && 
                      labels.length > 0 && actualPowerData.length > 0 && forecastPowerData.length > 0;

  const dataSource: ChartDataItem[] = usePropsData 
    ? labels.map((label, index) => ({ 
        category: label, 
        actualPower: actualPowerData[index], 
        forecastedPower: forecastPowerData[index] 
      })) 
    : hardcodedChartData;

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
               date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch (e) { /* Ignore formatting errors */ }
    const parts = dateString.split(' ');
    if (parts.length >= 4) {
      return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3].substring(0, 5)}`; // e.g., Mon Nov 25 00:00
    }
    return dateString;
  };

  const simplificationFactor = 2; 
  const simplifiedData: ChartDataItem[] = [];
  for (let i = 0; i < dataSource.length; i += simplificationFactor) {
    simplifiedData.push(dataSource[i]);
  }

  const categories = simplifiedData.map(item => formatDateForDisplay(item.category));
  const actualData = simplifiedData.map(item => item.actualPower);
  const forecastedData = simplifiedData.map(item => item.forecastedPower);

  const series = [
    {
      name: t('forecast.charts.actualPower', 'Actual Power (kW)'),
      data: actualData,
      color: '#E53E3E', 
    },
    {
      name: t('forecast.charts.forecastPower', 'Forecast Power (kW)'),
      data: forecastedData,
      color: '#3182ce', 
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: getChartToolbarConfig('wind-actual-vs-predicted', 2)
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    title: {
      text: t('forecast.charts.actualVsForecastTitle', 'Actual vs. Forecast Power Output'),
      align: 'left'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number | undefined) => val !== undefined ? `${val.toFixed(1)} kW` : '',
      },
    },
    xaxis: {
      categories: categories, 
      title: {
        text: t('forecast.charts.timeAxis', 'Time')
      },
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        style: {
            fontSize: '10px',
        }
      },
      tickAmount: categories.length > 24 ? Math.floor(categories.length / 8) : undefined, 
    },
    yaxis: {
      title: {
        text: t('forecast.charts.powerOutput', 'Power Output (kW)')
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(0)} kW`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -10
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    noData: {
      text: isLoading ? t('common.loading', 'Loading...') : t('common.noData', 'No data available'),
      align: 'center',
      verticalAlign: 'middle',
      offsetY: 0,
      style: {
        color: '#666666',
        fontSize: '14px',
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 p-4 rounded-md h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <ReactApexChart 
      options={options} 
      series={series} 
      type="line" 
      height={350} 
    />
  );
};

export default WindActualVsPredictedChart;
