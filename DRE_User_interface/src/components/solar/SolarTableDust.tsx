import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import { formatDateInTimezone } from "../../utils/formatDateInTimeZone";
import { solarDustTable } from "../../models/GetSolarDataResponseDust";

interface Props {
  data: solarDustTable[];
  dust?: number;
}
 


const SolarTableDust = ({ data }: Props) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<solarDustTable>();
  const columns = [
    columnHelper.accessor((row) => row.timestamp, {
      id: "datetime",
      cell: (info) =>
        format(formatDateInTimezone(info.getValue(), +3), "dd/MM/yyy HH:mm"),
      header: () => <span>{t("dataItem.datetime")}</span>,
    }),
    columnHelper.accessor("aot", {
      cell: (info) => info.getValue(),
      header: () => <span>{"AOT"}</span>,
    }),
    
    columnHelper.accessor("ghi", {
      cell: (info) => info.getValue() ,
      header: () => <span>{"GHI"}</span>,
    }),
    columnHelper.accessor("ghicorrected", {
      cell: (info) => info.getValue() ,
      header: () => <span>{"GHI Corrected"}</span>,
    }),
    columnHelper.accessor("procuctioncorrected", {
      cell: (info) => info.getValue() ,
      header: () => <span>{"Output Corrected"}</span>,
    }),
    columnHelper.accessor("production", {
      cell: (info) => info.getValue() ,
      header: () => <span>{"Output"}</span>,
    }),
    columnHelper.accessor("reduction", {
      cell: (info) => info.getValue() ,
      header: () => <span>{"Reduction"}</span>,
    }),
 
 
  ].filter(Boolean);

  return (
    <div className="p-2">
      <Table columns={columns} data={data} />
    </div>
  );
};

export default SolarTableDust;
