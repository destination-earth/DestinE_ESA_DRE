import { windDataTable } from "../../models/GetWindDataResponse";
import LineChart from "../LineChart";
import { commonSeries } from "../defaultOptions";

interface Props {
  data: windDataTable[];
}

const WindModelPredictionChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const powers = data.map((d) => d.powerKw);
  const speeds = data.map((d) => d.airSpeed);

  const series = [
    {
      ...commonSeries,
      name: "Forecasted Power Output (kW)",
      data: powers,
    },
    {
      ...commonSeries,
      name: "Speed (m/s)",
      data: speeds,
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
    {
      opposite: true,
      title: {
        text: "m/s",
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
      <LineChart data={series} yaxis={yaxis} xaxis={xaxis}   colors={["#3f5df2" ,"#10c43d" ]} />
    </div>
  );
};

export default WindModelPredictionChart;
