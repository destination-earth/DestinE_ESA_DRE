import SolarLineChart from "./SolarLineChart";
import { commonSeries } from "../defaultOptions";
import { MeteroLogicalRecord } from "../../models/GetSolarDataResponse";

interface Props {
  data: MeteroLogicalRecord[];
}

const SolarPlantProductionChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const temperatures = data.map((d) => d.ambientTemperature);
  const solars = data.map((d) => d.solarIrradiationDust);

  const series: ApexAxisChartSeries = [
    {
      ...commonSeries,
      name: "Temperature (°C)",
      data: temperatures,
    },
    {
      ...commonSeries,
      name: "Solar Irradiation (kWh/m²)",
      data: solars,
    },
  ];

  const yaxis: ApexYAxis[] = [
    {
      title: {
        text: "°C",
      },
      labels: {
        formatter: (value) => `${value}`,
      },
    },
    {
      opposite: true,
      title: {
        text: "kWh/m²",
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
      <SolarLineChart data={series} yaxis={yaxis} xaxis={xaxis}  colors={["#9fb5c7", "#e8fc03", "#f00"]}/>
    </div>
  );
};

export default SolarPlantProductionChart;
