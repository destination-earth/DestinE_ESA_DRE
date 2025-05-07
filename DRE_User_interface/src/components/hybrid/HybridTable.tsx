import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import { hybridDataTable } from "../../models/GetHybridDataResponse";
import { formatDateInTimezone } from "../../utils/formatDateInTimeZone";

interface Props {
  data: hybridDataTable[];
}

const HybridTable = ({ data }: Props) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<hybridDataTable>();
  const columns = [
    columnHelper.accessor((row) => row.datetime, {
      id: "datetime",
      cell: (info) =>
        format(formatDateInTimezone(info.getValue(), +3), "dd/MM/yyy HH:mm"),
      header: () => <span>{t("dataItem.datetime")}</span>,
    }),
    columnHelper.accessor((row) => row.directionWind, {
      id: "directionDeg",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.directionDeg")}</span>,
    }),
    columnHelper.accessor((row) => row.airSpeedWind, {
      id: "speedMs",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.speedMs")}</span>,
    }),
    columnHelper.accessor((row) => row.powerkWWind, {
      id: "powerKwWind",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.powerKwWind")}</span>,
    }),
    columnHelper.accessor((row) => row.ambientTemperature, {
      id: "ambientTemperature",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.ambientTemperature")}</span>,
    }),
    columnHelper.accessor((row) => row.solarIrradiance, {
      id: "ghiwhm2",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.ghiwhm2")}</span>,
    }),
    columnHelper.accessor((row) => row.powerkWSolar, {
      id: "powerKwSolar",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.powerKwSolar")}</span>,
    }),
    columnHelper.accessor((row) => row.powerkWTotal, {
      id: "powerKwTotal",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.powerKwTotal")}</span>,
    }),
  ];

  return (
    <div className="p-2">
      <Table columns={columns} data={data} />
    </div>
  );
};

export default HybridTable;
