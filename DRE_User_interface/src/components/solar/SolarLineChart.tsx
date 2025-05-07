import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface Props {
  data: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
  yaxis: ApexYAxis | ApexYAxis[] | undefined;
  xaxis: ApexXAxis;
  colors?: string[];
  dashArray?: number[];
}

const SolarLineChart = ({ data, xaxis, yaxis, dashArray, colors }: Props) => {
  const options: ApexOptions = {
    stroke: {
      curve: "straight",
      width: [3, 3],
      dashArray: dashArray, 
    },
    yaxis,
    xaxis,        
    colors:colors,
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true, // Force legend to always appear
      showForSingleSeries: true, // Explicitly show legend for a single series
 
      fontSize: "14px",

    },
    fill: {
      gradient: {
        opacityFrom: 1,
        stops: [100],
      },
    },
  };

  const tooltip = {
    x: {
      formatter: (value: number) => new Date(value).toLocaleString(), // Display full date in tooltip
    },
  };

  return (
    <ReactApexChart  tooltip={tooltip} options={options} series={data} type="area" height={350} />
  );
};

export default SolarLineChart;
