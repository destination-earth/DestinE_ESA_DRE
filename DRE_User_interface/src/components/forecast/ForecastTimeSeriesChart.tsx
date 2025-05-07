import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { TimeSeriesDataPoint } from '../../services/api/forecastTypes';
import { getChartToolbarConfig } from '../../utils/svgIcons';

interface ForecastTimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  isLoading: boolean;
  energyType: 'solar' | 'wind';
}

const ForecastTimeSeriesChart: React.FC<ForecastTimeSeriesChartProps> = ({ 
  data, 
  isLoading,
  energyType
}) => {
  // Format dates for display
  const formatDateForDisplay = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // If it's midnight (00:00), show the date as well
    if (hours === 0 && minutes === 0) {
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
    
    // Otherwise just show the hour
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Prepare data for the chart
  const categories = data?.map(item => formatDateForDisplay(item.datetime)) || [];
  const powerData = data?.map(item => item.power || item.powerKw || 0) || [];
  const irradiationData = data?.map(item => item.irradiation || 0) || [];

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: getChartToolbarConfig(`${energyType}-forecast`, 6)
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
      text: `Forecasted ${energyType === 'solar' ? 'Solar Power and Irradiation' : 'Wind Power'}`,
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
    colors: [energyType === 'solar' ? '#DD6B20' : '#3182CE', '#FFD700'], // Darker orange for solar, darker blue for wind, gold for irradiation
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
    yaxis: energyType === 'solar' ? [
      {
        title: {
          text: 'kW'
        },
        labels: {
          formatter: (value) => Math.round(value).toString()
        }
      },
      {
        opposite: true,
        title: {
          text: 'kWh/m²'
        },
        labels: {
          formatter: (value) => value.toFixed(1)
        }
      }
    ] : {
      title: {
        text: 'Power (kW)'
      },
      labels: {
        formatter: (value) => Math.round(value).toString()
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        formatter: (val: number, opts: { seriesIndex?: number; dataPointIndex?: number }) => {
          // Get the datetime from the series data
          const dataPointIndex = opts.dataPointIndex || 0;
          const datetime = data[dataPointIndex]?.datetime;
          
          if (!datetime) return String(val);
          
          const date = new Date(datetime);
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          
          if (hours === 0 && minutes === 0) {
            return date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric'
            });
          }
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      },
      y: {
        formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
          if (seriesIndex === 0) {
            return `${Math.round(value)} kW`;
          } else {
            return `${value.toFixed(1)} kWh/m²`;
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
      name: `${energyType === 'solar' ? 'Solar' : 'Wind'} Power`,
      data: powerData,
      type: 'line'
    },
    ...(energyType === 'solar' ? [{
      name: 'Irradiation',
      data: irradiationData,
      type: 'line'
    }] : [])
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-100 p-4 rounded-md h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  // Error state (no data)
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-md h-64 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <ReactApexChart 
        options={options} 
        series={series} 
        type="line"
        height={350} 
      />
    </div>
  );
};

export default ForecastTimeSeriesChart;
