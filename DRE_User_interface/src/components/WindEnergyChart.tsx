import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { chartDataRaw } from './chart_data'; // your full dataset

const WindEnergyChart = () => {
  const xValues = chartDataRaw.map(d => d.X);
  const pdfData = chartDataRaw.map(d => d.pdf ?? null);
  const frequencyData = chartDataRaw.map(d => d.frequency ?? null);
  const energyData = chartDataRaw.map(d => d.energy ?? null);

  const chartOptions:EChartsOption =  {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: [   { name: 'PDF', icon: 'rect' }, 'Frequency', 'Energy']
    },
    xAxis: {
      type: 'category',
      data: xValues,
      name: 'X',
    },
    yAxis: [
      {
        type: 'value',
        name: 'PDF / Frequency',
        position: 'left',
      },
      {
        type: 'value',
        name: 'Energy',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#000'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "solid",
            color: "#E0E0E0",
          },
        },
      }
    ],
    series: [
      {
        name: 'PDF',
        type: 'line',  
        smooth: true,
        showSymbol: false,
        data: pdfData,
        yAxisIndex: 0,
        itemStyle: {
          color: 'red' // 🎨 You can use any CSS color, hex, or rgba
        },
      },
      {
        name: 'Frequency',
        type: 'bar',
        data: frequencyData,
        yAxisIndex: 0,
        barCategoryGap: '0%',
        barGap: '0%',
        itemStyle: {
          color: '#4DD0E1' // 🎨 You can use any CSS color, hex, or rgba
        },
      },
      {
        name: 'Energy',
        type: 'scatter',
        symbol: 'rect',       // Rectangular symbol (can look like a line)
        symbolSize: [10, 4],
        itemStyle: {
          color: 'blue' // 🎨 You can use any CSS color, hex, or rgba
        },
      
        data: energyData,
        yAxisIndex: 1,
      }
    ]
  };

  return <ReactECharts option={chartOptions} style={{ height: 400 }} />;
};

export default WindEnergyChart;
