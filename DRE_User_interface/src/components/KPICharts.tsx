// import { KPI } from "../models/GetSolarDataResponse";
// import Card from "./ui/Card";

// interface Props {
//   data: KPI[];
// }

// const KPICharts = ({ data }: Props) => {
//   return (
//     <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//       {data?.map((kpi, index) => (
//         <Card key={index} title={kpi.label}>
//           <span className="flex h-full items-end text-3xl font-semibold">
//             {kpi.value}
//           </span>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default KPICharts;


import { KPI } from "../models/GetSolarDataResponse";
import Card from "./ui/Card";

interface Props {
  data: KPI[];
}

const KPICharts = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((kpi) => (
        <Card key={kpi.id} title={kpi.label}>
          <div className="flex flex-col h-full justify-between">
            <span className="text-3xl font-semibold">{kpi.value ?? "N/A"}%</span>
            {kpi.details && (
              <p className="mt-2 text-sm text-gray-500">{kpi.details}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KPICharts;
