import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
 


interface Props {
  data: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
  yaxis: ApexYAxis | ApexYAxis[] | undefined;
  xaxis: ApexXAxis;
  colors?: string[];
  opts?: ApexOptions;
}

const HybridLineChart = ({ data, xaxis, yaxis}: Props) => {
 
  const options: ApexOptions = {
    stroke: {
      curve: "straight",
      width: [3, 3, 3, 3, 3, 3, 3],
    },
    yaxis,
    xaxis, 
    colors:['#00db4d','#a4b3a8','#ffb300',"#3f5df2",'#fc0a83','#fcba03', "#3f5df2"],
    dataLabels: {
      enabled: false,
    },
   // chart:opts?.chart,

    chart: {
      events: {
        mounted: (chart) => {
          chart.hideSeries("Wind Speed (m/s)"); 
          chart.hideSeries("Wind Direction (Deg)"); 
          chart.hideSeries("Temperature (°C)"); 
          chart.hideSeries("Solar Ιrradiation (kWh/m²)"); 
        },
      },},

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

export default HybridLineChart;
