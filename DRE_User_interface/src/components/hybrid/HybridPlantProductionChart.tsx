import { HybridItem } from "../../models/HybridItem";
import LineChart from "../LineChart";
import { commonSeries } from "../defaultOptions";

interface Props {
  data: HybridItem[];
}

const HybridPlantProductionChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const directions = data.map((d) => d.directionDeg);
  const speeds = data.map((d) => d.speedMs);
  const ambientTemperature = data.map((d) => d.ambientTemperature);
  const solarIradiance = data.map((d) => d.ghiwhm2);

  const series = [
    {
      ...commonSeries,
      name: "Wind Speed (m/s)",
      data: speeds,
      color: "#00e296",
    },
    {
      ...commonSeries,
      name: "Wind Direction (degrees)",
      data: directions,
      color: "#008ffb",
    },
    {
      ...commonSeries,
      name: "Temperature (°C)",
      data: ambientTemperature,
      color: "#fcba03",
    },

    {
      ...commonSeries,
      name: "Solar Irradiation (kWh/m²)",
      data: solarIradiance,
      color: "#e8fc03",
    },
  ];

  const yaxis: ApexYAxis[] = [
    {
      opposite: false,
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
    {
      opposite: true,
      title: {
        text: "oC",
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
      <LineChart data={series} yaxis={yaxis} xaxis={xaxis} />
    </div>
  );
};

export default HybridPlantProductionChart;
