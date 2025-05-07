import SolarLineChart from "./SolarLineChart";
import { useState } from "react";
import { solarDustTable } from "../../models/GetSolarDataResponseDust";


interface Props {
  data: solarDustTable[];
  dust?: number;
}

const SolarModelWithDustPredictionChartDustAot = ({ data, dust }: Props) => {
  const [chartType] = useState<"line" | "column">("line");

  
  const dates = data.map((d) => new Date(d.timestamp).getTime());
  const aot = data.map((d) => d.aot);

  const dashArray= dust! > 0 ?  [0, 5] :  [0, 0];

  const series = [
    {
      type: chartType,
      name: "AOT",
      data: aot,
    }  
  ];

  const yaxis: ApexYAxis[] = [
    {
      title: {
        text: "AOT Value",
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
      <div className="mb-5">
        <div className="flex items-center gap-10">
        </div>
      </div>

      <SolarLineChart data={series} yaxis={yaxis} xaxis={xaxis} dashArray={dashArray} colors={["#e8fc03"]}/>
    </div>
  );
};

export default SolarModelWithDustPredictionChartDustAot;
