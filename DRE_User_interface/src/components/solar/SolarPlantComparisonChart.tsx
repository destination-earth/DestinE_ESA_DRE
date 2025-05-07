import SolarLineChart from "./SolarLineChart";
import { commonSeries } from "../defaultOptions";
import { MeteroLogicalRecord } from "../../models/GetSolarDataResponse";

interface Props {
  data: MeteroLogicalRecord[];
}

const SolarPlantComparisonChart = ({ data }: Props) => {
  const dates = data.map((d) => new Date(d.datetime).getTime());
  const temperatures = data.map((d) => d.ambientTemperature);
  const solars = data.map((d) => d.solarIrradiationDust);

  const dashArray= [ 0,5] ;

  const series: ApexAxisChartSeries = [
    {
      ...commonSeries,
      name: "Forecasted Power Output (kW)",
      data: solars,
    },
    {
      ...commonSeries,
      name: "Actual Power Output (kW)",
      data: temperatures ,
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
      
      // formatter: function( timestamp) {       
      //   return new Date(timestamp).toLocaleString('en-US', {
      //     month: 'short',
      //     day: 'numeric',
      //     hour: 'numeric',
      //     minute: 'numeric'
      //   });
      // }


    },



    
  };

  return (
    <div>
      <SolarLineChart data={series} yaxis={yaxis}  dashArray={dashArray} xaxis={xaxis}  colors={[ "#fcba03","#e8fc03"  ]}/>
    </div>
  );
};

export default SolarPlantComparisonChart;
