import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { PredictionComparisonPoint } from '../../services/api/forecastTypes';
import { getChartToolbarConfig } from '../../utils/svgIcons';

interface ForecastPredictionComparisonChartProps {
  data: PredictionComparisonPoint[];
  isLoading: boolean;
  energyType: 'solar' | 'wind';
}

const ForecastPredictionComparisonChart: React.FC<ForecastPredictionComparisonChartProps> = ({ 
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

  // Filter data to show 2-hour intervals
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by date to ensure we keep midnight points (00:00) for date labels
    const dateGroups: Record<string, PredictionComparisonPoint[]> = {};
    
    data.forEach(point => {
      const date = new Date(point.datetime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }
      
      dateGroups[dateKey].push(point);
    });
    
    // For each date, keep points at 2-hour intervals and always keep midnight
    const result: PredictionComparisonPoint[] = [];
    
    Object.values(dateGroups).forEach(points => {
      points.forEach(point => {
        const date = new Date(point.datetime);
        const hours = date.getUTCHours();
        
        // Always keep midnight points and points at even-hour intervals
        if (hours === 0 || hours % 2 === 0) {
          result.push(point);
        }
      });
    });
    
    // Sort by datetime
    return result.sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }, [data]);

  // Prepare data for the chart
  const datetimes = filteredData?.map(item => formatDateForDisplay(item.datetime)) || [];
  const actual = filteredData?.map(item => item.actual) || [];
  const predicted = filteredData?.map(item => item.predicted) || [];

  // Chart series
  const series = [
    {
      name: 'Actual',
      data: actual,
      color: '#E53E3E', // Red for actual
    },
    {
      name: 'Predicted',
      data: predicted,
      color: '#3182ce', // Blue for predicted
      ...(energyType === 'solar' ? { yAxisIndex: 1 } : {})
    }
  ];

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: getChartToolbarConfig(`${energyType}-actual-vs-predicted`, 6)
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      dashArray: [0, 5]
    },
    title: {
      text: `Actual vs Predicted ${energyType === 'solar' ? 'Solar' : 'Wind'} Power Production (kW)`,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#718096'
      },
      margin: 30
    },
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      }
    },
    xaxis: {
      categories: datetimes,
      title: {
        text: 'Time (2-hour intervals)'
      },
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: '11px',
          fontWeight: 600 // Medium weight for all labels
        }
      }
    },
    yaxis: energyType === 'solar' ? [
      {
        title: {
          text: 'Power Production (kW)'
        },
        labels: {
          formatter: (value: number) => Math.round(value).toString()
        }
      },
      // {
      //   opposite: true,
      //   title: {
      //     text: 'Forecasted Power (kW)'
      //   },
      //   labels: {
      //     formatter: (value: number) => Math.round(value).toString()
      //   }
      // }
    ] : {
      title: {
        text: 'Power (kW)'
      },
      labels: {
        formatter: (value: number) => Math.round(value).toString()
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12
      },
      offsetY: -14,
      offsetX: 0
    },
    tooltip: {
      x: {
        formatter: (val: number) => {
          // val is 1-based index for the x-axis categories
          const index = val - 1;
          if (index < 0 || index >= filteredData.length) return '';
          
          const datetime = filteredData[index].datetime;
          const date = new Date(datetime);
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          
          if (hours === 0 && minutes === 0) {
            const formattedDate = date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric'
            });
            return `<span style="font-weight:bold">${formattedDate}</span>`;
          }
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      },
      y: {
        formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
          if (energyType === 'solar') {
            if (seriesIndex === 0) {
              return `${Math.round(value)} kW`;
            } else {
              return `${Math.round(value)} kW`;
            }
          } else {
            return `${Math.round(value)} kW`;
          }
        }
      },
      shared: true,
      intersect: false
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-100 p-4 rounded-md h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  // Error state (no data)
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-md h-64 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 my-6 rounded-md">
      <ReactApexChart 
        options={options} 
        series={series} 
        type="line" 
        height={350} 
      />
    </div>
  );
};

export default ForecastPredictionComparisonChart;
