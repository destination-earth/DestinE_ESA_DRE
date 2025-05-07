import { comparison } from "../../models/GetWindDataResponse";
import LineChart from "../LineChart";
import { commonSeries } from "../defaultOptions";

interface Props {
  data: comparison[];
}

const HybridPlantComparisonChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const forecastpower = data.map((d) => d.forecastpower);
  const outputpower = data.map((d) => d.outputpower);
 //const ambientTemperature = data.map((d) => d.ambientTemperature);
  //const solarIradiance = data.map((d) => d.ghiwhm2);

  const dashArray= [5, 0] ;

  const series: ApexAxisChartSeries = [
    {
      ...commonSeries,
      name: "Forecasted Power Output(kW)",
      data: forecastpower,
    },
    {
      ...commonSeries,
      name: "Actual Power Output(kW)",
      data: outputpower,
    },
  ];
  const yaxis: ApexYAxis[] = [

    { 
      title: {
        text: "kW",
      },
      labels: {
        formatter: (value) => `${value}`,
      },
    },
  ];
  const xaxis: ApexXAxis = {
    categories: dates,
    type: "datetime",
    labels: {
      datetimeUTC: false, // This displays the time as provided in your data
    },
  };

  return (
    <div>
      <LineChart data={series} yaxis={yaxis} xaxis={xaxis}  dashArray={dashArray}  colors={["#fc0a83" , "#e8fc03"]}/>
    </div>
  );
};

export default HybridPlantComparisonChart;
