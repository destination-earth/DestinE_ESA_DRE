import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getChartToolbarConfig } from '../../utils/svgIcons';

export interface WindPowerSpeedChartProps {
  isLoading?: boolean;
  labels?: string[];
  powerData?: number[];
  windSpeedData?: number[];
}

// Hardcoded data from wind.csv
const windPowerSpeedData = [
  // Sunday, Nov 24 data
  { category: 'Sun Nov 24 2024 00:00:00', powerOutput: 1202.5, windSpeed: 7.8 },
  { category: 'Sun Nov 24 2024 01:00:00', powerOutput: 3130.8, windSpeed: 11.7 },
  { category: 'Sun Nov 24 2024 02:00:00', powerOutput: 3472.6, windSpeed: 13.1 },
  { category: 'Sun Nov 24 2024 03:00:00', powerOutput: 3356.8, windSpeed: 12.6 },
  { category: 'Sun Nov 24 2024 04:00:00', powerOutput: 3472.6, windSpeed: 12.8 },
  { category: 'Sun Nov 24 2024 05:00:00', powerOutput: 3130.8, windSpeed: 11.7 },
  { category: 'Sun Nov 24 2024 06:00:00', powerOutput: 609, windSpeed: 6.5 },
  { category: 'Sun Nov 24 2024 07:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 08:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 09:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 10:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 11:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 12:00:00', powerOutput: 0.4, windSpeed: 3.0 },
  { category: 'Sun Nov 24 2024 13:00:00', powerOutput: 0.4, windSpeed: 3.1 },
  { category: 'Sun Nov 24 2024 14:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 15:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 16:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 17:00:00', powerOutput: 0.4, windSpeed: 2.9 },
  { category: 'Sun Nov 24 2024 18:00:00', powerOutput: 0.4, windSpeed: 3.0 },
  { category: 'Sun Nov 24 2024 19:00:00', powerOutput: 0.4, windSpeed: 3.0 },
  { category: 'Sun Nov 24 2024 20:00:00', powerOutput: 0.4, windSpeed: 3.2 },
  { category: 'Sun Nov 24 2024 21:00:00', powerOutput: 5.7, windSpeed: 3.5 },
  { category: 'Sun Nov 24 2024 22:00:00', powerOutput: 91.3, windSpeed: 4.6 },
  { category: 'Sun Nov 24 2024 23:00:00', powerOutput: 303.3, windSpeed: 5.6 },
  // Monday, Nov 25 data
  { category: 'Mon Nov 25 2024 00:00:00', powerOutput: 29.1, windSpeed: 4.0 },
  { category: 'Mon Nov 25 2024 01:00:00', powerOutput: 181.5, windSpeed: 5.1 },
  { category: 'Mon Nov 25 2024 02:00:00', powerOutput: 181.5, windSpeed: 4.9 },
  { category: 'Mon Nov 25 2024 03:00:00', powerOutput: 181.5, windSpeed: 4.8 },
  { category: 'Mon Nov 25 2024 04:00:00', powerOutput: 29.1, windSpeed: 4.2 },
  { category: 'Mon Nov 25 2024 05:00:00', powerOutput: 0.4, windSpeed: 3.0 },
  { category: 'Mon Nov 25 2024 06:00:00', powerOutput: 0.4, windSpeed: 3.1 },
  { category: 'Mon Nov 25 2024 07:00:00', powerOutput: 29.1, windSpeed: 3.9 },
  { category: 'Mon Nov 25 2024 08:00:00', powerOutput: 91.3, windSpeed: 4.6 },
  { category: 'Mon Nov 25 2024 09:00:00', powerOutput: 181.5, windSpeed: 5.0 },
  { category: 'Mon Nov 25 2024 10:00:00', powerOutput: 303.3, windSpeed: 5.7 },
  { category: 'Mon Nov 25 2024 11:00:00', powerOutput: 455.1, windSpeed: 6.0 },
  { category: 'Mon Nov 25 2024 12:00:00', powerOutput: 455.1, windSpeed: 6.2 },
  { category: 'Mon Nov 25 2024 13:00:00', powerOutput: 181.5, windSpeed: 5.2 },
  { category: 'Mon Nov 25 2024 14:00:00', powerOutput: 29.1, windSpeed: 4.2 },
  { category: 'Mon Nov 25 2024 15:00:00', powerOutput: 29.1, windSpeed: 3.9 },
  { category: 'Mon Nov 25 2024 16:00:00', powerOutput: 91.3, windSpeed: 4.6 },
  { category: 'Mon Nov 25 2024 17:00:00', powerOutput: 455.1, windSpeed: 5.8 },
  { category: 'Mon Nov 25 2024 18:00:00', powerOutput: 181.5, windSpeed: 4.8 },
  { category: 'Mon Nov 25 2024 19:00:00', powerOutput: 29.1, windSpeed: 4.0 },
  { category: 'Mon Nov 25 2024 20:00:00', powerOutput: 181.5, windSpeed: 4.8 },
  { category: 'Mon Nov 25 2024 21:00:00', powerOutput: 455.1, windSpeed: 5.8 },
  { category: 'Mon Nov 25 2024 22:00:00', powerOutput: 181.5, windSpeed: 4.8 },
  { category: 'Mon Nov 25 2024 23:00:00', powerOutput: 29.1, windSpeed: 3.9 }
];

const WindPowerSpeedChart: React.FC<WindPowerSpeedChartProps> = ({ 
  isLoading = false,
  labels,
  powerData,
  windSpeedData
}) => {
  // Format dates for display - same as in ForecastTimeSeriesChart
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // If it's midnight (00:00), show the date as well
      if (hours === 0 && minutes === 0) {
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
      }
      
      // Otherwise just show the hour
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      // If parsing fails, return the original string
      return dateString;
    }
  };

  // Determine which data source to use
  const usePropsData = labels && powerData && windSpeedData && 
                      labels.length > 0 && powerData.length > 0 && windSpeedData.length > 0;

  // Process data based on source
  const categories = usePropsData 
    ? labels.map(label => formatDateForDisplay(label)) // Format date labels if needed
    : windPowerSpeedData.map((item) => item.category);

  const powerDataToUse = usePropsData 
    ? powerData 
    : windPowerSpeedData.map((item) => item.powerOutput);

  const windSpeedDataToUse = usePropsData 
    ? windSpeedData 
    : windPowerSpeedData.map((item) => item.windSpeed);

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: getChartToolbarConfig('wind-power-speed', 6)
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],  // Equal width for both lines
      dashArray: [0, 0]  // Solid lines for both
    },
    markers: {
      size: 0,  // Remove markers
    },
    title: {
      text: 'Wind Power and Speed',
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#718096'
      }
    },
    fill: {
      type: 'solid'
    },
    colors: ['#3182CE', '#38B2AC'], // Blue for power, teal for wind speed
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: '11px',
          fontWeight: 600 // Medium weight for all labels
        }
      },
      title: {
        text: 'Time'
      }
    },
    yaxis: [
      {
        title: {
          text: 'Power (kW)'
        },
        labels: {
          formatter: (value) => Math.round(value).toString()
        }
      },
      {
        opposite: true,
        title: {
          text: 'Wind Speed (m/s)'
        },
        labels: {
          formatter: (value) => value.toFixed(1)
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
          if (seriesIndex === 0) {
            return `${Math.round(value)} kW`;
          } else {
            return `${value.toFixed(1)} m/s`;
          }
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12
      }
    }
  };

  // Chart series
  const series = [
    {
      name: 'Wind Power',
      data: powerDataToUse,
      type: 'line'
    },
    {
      name: 'Wind Speed',
      data: windSpeedDataToUse,
      type: 'line'
    }
  ];

  // Loading state
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

export default WindPowerSpeedChart;
