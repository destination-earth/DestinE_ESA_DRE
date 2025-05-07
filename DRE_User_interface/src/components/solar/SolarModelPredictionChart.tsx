import SolarLineChart from "./SolarLineChart";
import { commonSeries } from "../defaultOptions";
import { OldSolarItem } from "../../models/GetSolarDataResponse";

interface Props {
  data: OldSolarItem[];
}

const SolarModelPredictionChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const powers = data.map((d) => d.powerKw);
  const solars = data.map((d) => d.ghiwhm2);

  const series = [
    {
      ...commonSeries,
      name: "Forecasted Power Output (kW)",
      data: powers,
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
        text: "KW",
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
  };

  return (
    <div>
      <SolarLineChart data={series} yaxis={yaxis} xaxis={xaxis} />
    </div>
  );
};

export default SolarModelPredictionChart;
