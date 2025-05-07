import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface Props {
  data: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
  yaxis: ApexYAxis | ApexYAxis[] | undefined;
  xaxis: ApexXAxis;
  colors?: string[];
  dashArray?: number[];
}

const LineChart = ({ data, xaxis, yaxis, dashArray, colors }: Props) => {
  const options: ApexOptions = {
    stroke: {
      curve: "straight",
      width: [3, 3, 3, 3, 3, 3, 3],
      dashArray: dashArray, 
    },
    yaxis,
    xaxis, 
    colors:colors,
    dataLabels: {
      enabled: false,
    },
    fill: {
      gradient: {
        opacityFrom: 1,
        stops: [100],
      },
    },
  };
  

  return (
    <ReactApexChart options={options} series={data} type="area" height={350} />
  );
};

export default LineChart;
