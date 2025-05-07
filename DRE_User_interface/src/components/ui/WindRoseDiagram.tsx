import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

// Define an interface for each wind speed range
export interface WindSpeedRange {
  label: string;
  data: number[];
}

// Define the props interface
export interface WindRoseDiagramProps {
  directions: string[];
  speedRanges: WindSpeedRange[];
}

const WindRoseDiagram: React.FC<WindRoseDiagramProps> = ({ directions, speedRanges }) => {
  const option: EChartsOption = {
    title: {
      text: 'Wind Rose Diagram',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        if (!Array.isArray(params)) return '';
        let tooltipText = `${params[0].name}<br/>`;
        params.forEach(item => {
          tooltipText += `${item.marker} ${item.seriesName}: ${item.value}%<br/>`;
        });
        return tooltipText;
      }
    },
    legend: {
      top: 'bottom',
      data: speedRanges.map(range => range.label)
    },
    polar: {},
    angleAxis: {
      type: 'category',
      data: directions,
      startAngle: 90
    },
    radiusAxis: {},
    series: speedRanges.map(range => ({
      name: range.label,
      type: 'bar',
      data: range.data,
      coordinateSystem: 'polar',
      stack: 'wind'
    }))
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 600, width: '100%' }}
    />
  );
};

export default WindRoseDiagram;
