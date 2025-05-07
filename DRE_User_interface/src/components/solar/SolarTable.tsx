import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import { formatDateInTimezone } from "../../utils/formatDateInTimeZone";
import { ProductionRecord } from "../../models/GetSolarDataResponse";

interface Props {
  data: ProductionRecord[];
  dust?: number;
}

const SolarTable = ({ data, dust }: Props) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<ProductionRecord>();
  const columns = [
    columnHelper.accessor((row) => row.datetime, {
      id: "datetime",
      cell: (info) =>
        format(formatDateInTimezone(info.getValue(), +3), "dd/MM/yyy HH:mm"),
      header: () => <span>{t("dataItem.datetime")}</span>,
    }),
    columnHelper.accessor("ambientTemperature", {
      cell: (info) => info.getValue()?.toFixed(1),
      header: () => <span>{t("dataItem.ambientTemperature")}</span>,
    }),
    columnHelper.accessor((row) => row.solarIrradiation, {
      id: "solarIrradiation",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.ghiwhm2")}</span>,
    }),
    columnHelper.accessor((row) => row.solarIrradiationDust, {
      id: "solarIrradiationDust",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.ghiwhm2")}</span>,
    }),
    columnHelper.accessor((row) => row.powerKw, {
      id: "powerKw",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.powerKw")}</span>,
    }),
    dust
      ? columnHelper.accessor((row) => row.powerKw, {
          id: "dust",
          cell: (info) => info.getValue(),
          header: () => <span>{"Dust column"}</span>,
        })
      : undefined,
  ].filter(Boolean);

  return (
    <div className="p-2">
      <Table columns={columns} data={data} />
    </div>
  );
};

export default SolarTable;
