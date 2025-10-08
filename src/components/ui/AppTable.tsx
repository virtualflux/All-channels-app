import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DebouncedInput from "./DebouncedInput";

interface ReusableTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  manualPagination?: boolean;
  totalDocs?: number;
  pageSize?: number;
  currentPage?: number;
  setCurrentPage?: Dispatch<SetStateAction<number>>;
}

const AppTable = <TData,>({
  data,
  columns,
  manualPagination = false,
  totalDocs,
  pageSize,
  currentPage,
  setCurrentPage,
}: ReusableTableProps<TData>) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize || 1000,
  });

  const [globalFilter, setGlobalFilter] = useState<any>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      pagination,
      globalFilter,
    },
    manualPagination,
    rowCount: totalDocs,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handlePreviousPage = () => {
    if (setCurrentPage && currentPage && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (setCurrentPage && totalDocs && currentPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="overflow-x-auto p-1 text ">
      <DebouncedInput
        value={""}
        onChange={(val) => table.setGlobalFilter(val)}
        type="text"
        placeholder="Search..."
        className="outline-none my-4 p-2 border focus:ring-2 focus:ring-teal-500 border-zinc-300 rounded bg-[#ffffff] text-zinc-800"
      />

      <table className="min-w-full border rounded-md border-zinc-300">
        <thead className=" text-zinc-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th key={header.id} className={`p-2 border text-left `}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-teal-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border text-zinc-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="bg-zinc-50">
              <td colSpan={100} className="py-12">
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#232529] mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#b2d8d8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">No record</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    There are no records to display
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <p className="font-semibold">
          Count: <span className="ml-1"> {table.getRowCount()}</span>
        </p>
      </div>

      {manualPagination &&
        currentPage &&
        totalDocs &&
        table.getPageCount() > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                handlePreviousPage();
                // table.previousPage();
              }}
              disabled={currentPage <= 1}
              className="cursor-pointer  hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="">
              Page {currentPage} of {table.getPageCount()}
            </span>
            <button
              onClick={() => {
                handleNextPage();
                // table.nextPage();
              }}
              disabled={currentPage >= table.getPageCount()}
              className="cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
};

export default AppTable;