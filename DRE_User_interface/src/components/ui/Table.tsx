import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faArrowDownWideShort,
  faArrowUpWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { useState } from "react";

// Define a custom meta type for columns that includes width
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    width?: string;
  }
}

interface Props {
  data: unknown[];
  columns: unknown[];
  initialSorting?: SortingState;
}
const Table = ({ columns, data, initialSorting = [] }: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<unknown, unknown>[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={classNames(
                      "p-1 text-center text-sm",
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      width: header.column.columnDef.meta?.width,
                      minWidth: header.column.columnDef.meta?.width,
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                      {header.column.getIsSorted() ? (
                        <FontAwesomeIcon
                          icon={
                            header.column.getIsSorted() === "asc"
                              ? faArrowDownWideShort
                              : faArrowUpWideShort
                          }
                        />
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={classNames(index % 2 === 0 ? "" : "bg-gray-100")}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls - fixed at the bottom */}
      <div className="sticky bottom-0 bg-white py-3 px-4 border-2 border-indigo-500 my-2 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className={classNames(
              "aspect-square w-8 rounded border",
              !table.getCanPreviousPage() ? "opacity-40" : "",
            )}
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button
            className={classNames(
              "aspect-square w-8 rounded border",
              !table.getCanPreviousPage() ? "opacity-40" : "",
            )}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <button
            className={classNames(
              "aspect-square w-8 rounded border",
              !table.getCanNextPage() ? "opacity-40" : "",
            )}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            className={classNames(
              "aspect-square w-8 rounded border",
              !table.getCanNextPage() ? "opacity-40" : "",
            )}
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>

        {/* <div className="text-sm text-gray-800">
            Showing {pagination.pageIndex * pagination.pageSize + 1} -{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              table.getRowCount(),
            )}{" "}
            of {table.getRowCount().toLocaleString()} Rows
          </div> */}
        
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16 rounded border p-1"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded border p-1"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            Showing {pagination.pageIndex * pagination.pageSize + 1} -{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              table.getRowCount(),
            )}{" "}
            of {table.getRowCount().toLocaleString()} Rows
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
