import SolarLineChart from "./SolarLineChart";
import { useState } from "react";
import { solarDustPercentage } from "../../models/GetSolarDataResponseDust";

interface Props {
  data: solarDustPercentage[];
  dust?: number;
}

const SolarModelWithDustPercentageChartDust = ({ data ,dust }: Props) => {
  const [chartType ] = useState<"line" | "column">("line");

  const dates = data.map((d) => new Date(d.date).getTime());
  const withaot = data.map((d) => d.withaot);
  console.log(withaot);
  const withsmallaot = data.map((d) => d.withsmallaot);
  const withmediumaot = data.map((d) => d.withmediumaot);
  const withhighaot = data.map((d) => d.withhighaot);
  
  //const powers_dust = !dust ? [] : powers.map((p) => p - p * (dust * 0.1));

  const dashArray= dust! > 0 ?  [0, 5] :  [0, 0];

  
  const series = [
 
    {
      type: chartType,
      name: "Without AOT correction",
      data: withaot,
    },
         
    ...(dust==1
      ? [
        {
          type: chartType,
          name: "With small AOT correction",
          data: withsmallaot,
        },   
        
        ]
      : []),
    
      ...(dust==2
        ? [
          {
            type: chartType,
            name: "With medium AOT correction",
            data: withmediumaot,
          },   
          
          ]
        : []), 
        
        ...(dust==3
          ? [
            {
              type: chartType,
              name: "With high AOT correction",
              data: withhighaot,
            }, 
            
            ]
          : []),


    

  ];

  const yaxis: ApexYAxis[] = [
    {
      title: {
        text: "Reduction Percentage for forecasted power output (kW)",
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

  // if (dust) {
  //   series.push({
  //     type: chartType,
  //     name: "Power Output with dust (kW)",
  //     data: withhighaot,
  //   });

  //   yaxis.push({
  //     title: {
  //       text: "KW",
  //     },
  //     labels: {
  //       formatter: (value) => `${value}`,
  //     },
  //   });
  // }

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-10">

        </div>
      </div>

      <SolarLineChart data={series} yaxis={yaxis} xaxis={xaxis} dashArray={dashArray} colors={["#fcba03", "#e8fc03", "#f00"]} />
    </div>
  );
};

export default SolarModelWithDustPercentageChartDust;
