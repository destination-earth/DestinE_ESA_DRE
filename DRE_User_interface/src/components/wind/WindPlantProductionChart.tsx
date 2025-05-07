import { WindItem } from "../../models/WindItem";
import LineChart from "../LineChart";
import { commonSeries } from "../defaultOptions";

interface Props {
  data: WindItem[];
}

const WindPlantProductionChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const directions = data.map((d) => d.directionDeg);
  const speeds = data.map((d) => d.speedMs);

  const series = [
    {
      ...commonSeries,
      name: "Speed (m/s)",
      data: speeds,
      color: "#00e296",
    },
    {
      ...commonSeries,
      name: "Direction (degrees)",
      data: directions,
      color: "#008ffb",
    },
  ];

  const yaxis: ApexYAxis[] = [
    {
      opposite: true,
      title: {
        text: "m/s",
      },
      labels: {
        formatter: (value) => `${value}`,
      },
    },
    {
      title: {
        text: "degrees",
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
      <LineChart data={series} yaxis={yaxis} xaxis={xaxis} />
    </div>
  );
};

export default WindPlantProductionChart;
