import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import { windDataTable } from "../../models/GetWindDataResponse";

interface Props {
    data: windDataTable[];
}

const WindTable = ({ data }: Props) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<windDataTable>();
  const columns = [
    columnHelper.accessor((row) => row.datetime, {
      id: "datetime",
      cell: (info) =>
        format(formatDateInTimezone(info.getValue(), +3), "dd/MM/yyy HH:mm"),
      header: () => <span>{t("dataItem.datetime")}</span>,
    }),
    columnHelper.accessor((row) => row.direction, {
      id: "directionDeg",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.directionDeg")}</span>,
    }),
    columnHelper.accessor((row) => row.airSpeed, {
      id: "speedMs",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.speedMs")}</span>,
    }),
    columnHelper.accessor((row) => row.powerKw, {
      id: "powerKw",
      cell: (info) => info.getValue(),
      header: () => <span>{t("dataItem.powerKw")}</span>,
    }),
  ];

  return (
    <div className="p-2">
      <Table columns={columns} data={data} />
    </div>
  );
};

function formatDateInTimezone(dateString: any, timezoneOffset = 0) {
  // Create a date object
  const date = new Date(dateString);

  // Get the current timezone offset in minutes and add the desired offset
  const offsetInMs =
    (date.getTimezoneOffset() + timezoneOffset * 60) * 60 * 1000;

  // Adjust the date based on the offset
  const adjustedDate = new Date(date.getTime() + offsetInMs);

  // Format the adjusted date using date-fns or native JavaScript
  return adjustedDate.toISOString().replace("T", " ").split(".")[0]; // Basic format example
}

export default WindTable;
