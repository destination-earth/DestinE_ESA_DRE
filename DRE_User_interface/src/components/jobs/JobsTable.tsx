//import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import { formatDateInTimezone } from "../../utils/formatDateInTimeZone";
import { jobs } from "../../models/JobsResponses";



interface Props {
  data: jobs[];
}

const JobsTable = ({ data }: Props) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<jobs>();




  const columns = [
    columnHelper.accessor((row) => row.datetimeStr, {
      id: "datetimeStr",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.datetime")}</span>,
      cell: (info) => (
        <span className="text-gray-700 font-medium">
          {format(formatDateInTimezone(info.getValue(), +3), "dd/MM/yyyy")}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.energySource, {
      id: "energySource",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.energySource")}</span>,
      cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.plan, {
      id: "plan",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.plan")}</span>,
      cell: (info) => {
        const value = info.getValue();
        let classes = "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm";
        if (value === "Annual") {
          classes = "bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm";
        } else if (value === "One-off") {
          classes = "bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm";
        } else if (value === "Free") {
          classes = "bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm";
        }
        return <span className={classes}>{value}</span>;
      },
    }),
    columnHelper.accessor((row) => row.progress, {
      id: "progress",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.progress")}</span>,
      cell: (info) => {
        const value = info.getValue();
        let classes = "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm";
        if (value === "Pending") {
          classes = "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm";
        } else if (value === "Completed") {
          classes = "bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm";
        } else if (value === "Failed") {
          classes = "bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm";
        }
        return <span className={classes}>{value}</span>;
      },
    }),
    columnHelper.accessor((row) => row.parameters, {
      id: "parameters",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.parameters")}</span>,
      cell: (info) => {
        const jsonStr = info.getValue();
        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch (error) {
          parsed = null;
        }

        const isValidDate = (dateString: string) => !isNaN(Date.parse(dateString));

        const tooltipContent = parsed ? (
          <div className="text-gray-700 space-y-1">
            {Object.entries(parsed).map(([key, value]) => {
              let displayValue: unknown = value;
              if (typeof value === "string" && isValidDate(value)) {
                displayValue = format(new Date(value), "dd/MM/yyyy HH:mm");
              }
              return (
                <div key={key} className="flex">
                  <span className="font-semibold mr-1">{key}:</span>
                  <span>
                    {typeof displayValue === "string"
                      ? displayValue
                      : JSON.stringify(displayValue)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-700">{jsonStr}</span>
        );

        return (
          <div className="relative group inline-block">
            <span className="text-blue-500 cursor-pointer">View Parameters</span>
            <div className="absolute z-10 left-0 top-full mt-2 w-64 p-2 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {tooltipContent}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.downloadUrl, {
      id: "downloadUrl",
      header: () => <span className="text-gray-900 font-semibold">{t("jobs.downloadUrl")}</span>,
      cell: (info) => (
        <a href={info.getValue()} className="text-blue-500 underline">
          {t("jobs.download")}
        </a>
      ),
    }),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default JobsTable;
