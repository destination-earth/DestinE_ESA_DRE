import { hybridDataTable } from "../../models/GetHybridDataResponse";
import HybridLineChart from "./HybridLineChart";
import { commonSeries } from "../defaultOptions";
import { ApexOptions } from "apexcharts";

interface Props {
  data: hybridDataTable[];
  opts?:ApexOptions;
}

const HybridModelPredictionChart = ({ data, opts}: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const powers = data.map((d) => d.powerkWTotal);
  const speeds = data.map((d) => d.airSpeedWind);
  const directionDeg = data.map((d) => d.directionWind);
  const ambientTemperature = data.map((d) => d.ambientTemperature);
  const ghiwhm2 = data.map((d) => d.solarIrradiance);
  const powerKwSolar = data.map((d) => d.powerkWSolar);
  const powerKwWind = data.map((d) => d.powerkWWind);
  const options = opts;

  const series = [
    {
      ...commonSeries,
      name: "Wind Speed (m/s)",
      data: speeds,
    },
    {
      ...commonSeries,
      name: "Wind Direction (Deg)",
      data: directionDeg,
    },
    {
      ...commonSeries,
      name: "Temperature (°C)",
      data: ambientTemperature,
    },
    {
      ...commonSeries,
      name: "Solar Ιrradiation (kWh/m²)",
      data: ghiwhm2,
    },
    {
      ...commonSeries,
      name: "Forecasted Power Output (kW)",
      data: powers,
    },
    {
      ...commonSeries,
      name: "Forecasted Solar Power (kW)",
      data: powerKwSolar,
    },
    {
      ...commonSeries,
      name: "Forecasted Wind Power (kW)",
      data: powerKwWind,
    },
  ];

  const yaxis: ApexYAxis[] = [
    // {
    //   opposite: false,
    //   title: {
    //     text: "m/s",
    //   },
    //   labels: {
    //     formatter: (value) => `${value}`,
    //   },
    // },
    // {
    //   opposite: false,
    //   title: {
    //     text: "Degrees",
    //   },
    //   labels: {
    //     formatter: (value) => `${value}`,
    //   },
    // },
    // {
    //   opposite: true,
    //   title: {
    //     text: "°C",
    //   },
    //   labels: {
    //     formatter: (value) => `${value}`,
    //   },
    // },
    // {
    //   opposite: true,
    //   title: {
    //     text: "kWh/m²",
    //   },
    //   labels: {
    //     formatter: (value) => `${value}`,
    //   },
    // },
    {
      opposite: false,
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
      <HybridLineChart data={series} yaxis={yaxis} opts={options} xaxis={xaxis} />
    </div>
  );
};

export default HybridModelPredictionChart;
