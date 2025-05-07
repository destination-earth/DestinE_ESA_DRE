import SolarLineChart from "./SolarLineChart";
import { useState } from "react";
import { useTranslation } from "react-i18next";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faChartColumn, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { PredictionRecord } from "../../models/GetSolarDataResponse";

interface Props {
  data: PredictionRecord[];
  dust?: number;
}

const SolarModelWithDustPredictionChart = ({ data, dust }: Props) => {
 
  //setChartType

  const [chartType, ] = useState<"line" | "column">("line");

  const dates = data.map((d) => new Date(d.datetime).getTime());
  const powers = data.map((d) => d.powerKw);
  const solars = data.map((d) => d.solarIrradiationDust);
  const powers_dust = !dust ? [] : powers.map((p) => p - p * (dust * 0.1));

  const { t } = useTranslation();

  const series = [
    {
      type: chartType,
      name: "Forecasted Power Output (kW)",
      data: powers,
    },
    {
      type: chartType,
      name: "Forecasted Solar Irradiation (kWh/m²)",
      data: solars,
    },
  ];

  const yaxis: ApexYAxis[] = [
    {
      title: {
        text: t("kW"),
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
    // labels: {
    //   formatter: (value) => new Date(value).toLocaleString(), // Display full date in x-axis
    // },
  };

  if (dust) {
    series.push({
      type: chartType,
      name: "Forecasted power output with dust (kW)",
      data: powers_dust,
    });

    yaxis.push({
      title: {
        text: "KW",
      },
      labels: {
        formatter: (value) => `${value}`,
      },
    });
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-10">
          {/* <button
            onClick={() =>
              setChartType(chartType === "column" ? "line" : "column")
            }
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={chartType === "column" ? faChartLine : faChartColumn}
                className={"text-gray-800"}
              />
              <div className="text-sm">
                {chartType === "column"
                  ? "Enable line view"
                  : "Enable column view"}
              </div>
            </div>
          </button> */}

          {/* {hasDustFilter ? <DustFilter onChange={(v) => setDust(v)} /> : null} */}
        </div>
      </div>

      <SolarLineChart  data={series} yaxis={yaxis} xaxis={xaxis} colors={["#fcba03", "#10c43d", "#f00"]} />
    </div>
  );
};

export default SolarModelWithDustPredictionChart;
