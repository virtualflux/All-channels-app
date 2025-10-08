"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AppTable from "../ui/AppTable";
import { IPriceList } from "@/types/pricelist.type";
import { ZohoCurrencies } from "@/types/zoho-inventory-currency.type";



const ROUNDING_LABEL: Record<IPriceList["rounding_type"], string> = {
  no_rounding: "No rounding",
  round_to_dollar: "Nearest whole number",
  round_to_dollar_minus_01: "0.99",
  round_to_half_dollar: "0.50",
  round_to_half_dollar_minus_01: "0.49",
};

type CurrencyRow = { currency_id: string; currency_code: string; currency_name?: string };


async function fetchCurrencies() {
    const res = await axios.get<{ data: CurrencyRow[] }>("/api/zoho/currencies");
    return res.data.data ?? [];
}


const PriceListsPage = ({ currencies }: { currencies: ZohoCurrencies["currencies"] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const fetchPriceLists = async (page: number) => {
      try {
        const res = await axios.get<{
          message: string;
          data: IPriceList[];
          count: number;
        }>(`/api/db/pricelists?page=${page}`);
        return { data: res.data.data, count: res.data.count };
      } catch {
        toast.error("Error fetching price lists. Please refresh.");
        return { data: [], count: 0 };
      }
    };

    const { data, isLoading, refetch } = useQuery({
      queryKey: ["pricelists", currentPage],
      queryFn: () => fetchPriceLists(currentPage),
    });

    const [busyId, setBusyId] = useState<string | null>(null);
    const [selected, setSelected] = useState<IPriceList | null>(null);

    type UpdateStatusPayload = { status: IPriceList["status"] };

    const updateStatus = async (id: string, status: IPriceList["status"]) => {
      setBusyId(id);
      try {
        await axios.put(`/api/db/pricelists/${id}`, {
          status,
        } as UpdateStatusPayload);
        toast.success(
          status === "approved" ? "Price list approved" : "Price list rejected"
        );
        refetch();
      } catch (e) {
        toast.error("Failed to update price list");
      } finally {
        setBusyId(null);
      }
    };

    const currencyMap = useMemo(() => {
      const map = new Map<string, string>();
      currencies.forEach((c) => map.set(c.currency_id, c.currency_code));
      return map;
    }, [currencies]);

    const approve = (id: string) => updateStatus(id, "approved");
    const reject = (id: string) => updateStatus(id, "rejected");

    const columns = useMemo(
      () => [
        {
          accessorKey: "name",
          header: "Name",
          cell: (info: any) => info.getValue(),
        },
        {
          accessorKey: "sales_or_purchase_type",
          header: "Applies To",
          cell: (info: any) => {
            const v = String(info.getValue() ?? "");
            return v ? v[0].toUpperCase() + v.slice(1) : "-";
          },
        },
        {
          accessorKey: "pricebook_type",
          header: "Type",
          cell: (info: any) => {
            const v = info.getValue() as IPriceList["pricebook_type"];
            return v === "fixed_percentage"
              ? "Fixed %"
              : v === "per_item"
              ? "Per Item"
              : v || "-";
          },
        },

        {
          accessorKey: "rounding_type",
          header: "Rounding",
          cell: (info: any) => {
            const val = info.getValue() as IPriceList["rounding_type"];
            return ROUNDING_LABEL[val] ?? "-";
          },
        },
        {
          accessorKey: "currency_id",
          header: "Currency",
          cell: (info: any) => {
            const currency = currencies.find(
              (item) => item.currency_id == info.getValue()
            );

            return currency?.currency_code;
          },
        },

        {
          accessorKey: "status",
          header: "Status",
          cell: (info: any) => {
            const status = info.getValue() as IPriceList["status"];
            const cls: Record<IPriceList["status"], string> = {
              pending: "bg-yellow-100 text-yellow-800",
              approved: "bg-green-100 text-green-800",
              rejected: "bg-red-100 text-red-800",
            };
            return (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${cls[status]}`}
              >
                {status[0].toUpperCase() + status.slice(1)}
              </span>
            );
          },
        },
        {
          id: "actions",
          header: "Actions",
          cell: (info: any) => {
            const row = info.row.original as IPriceList;
            const loading = busyId === row._id;

            if (row.status !== "pending") {
              return (
                <button
                  onClick={() => setSelected(row)}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                >
                  View
                </button>
              );
            }

            return (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelected(row)}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                >
                  View
                </button>

                {row.status === "pending" ? (
                  <>
                    <button
                      disabled={loading}
                      onClick={() => approve(row._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </span>
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => reject(row._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </span>
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500 text-center text-sm">
                    No actions
                  </span>
                )}
              </div>
            );
          },
        },
      ],
      [busyId]
    );

    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Manage Price Lists
            </h1>
            <p className="text-gray-600">Approve or reject price lists</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <div className="w-full my-2 h-8 p-2 bg-gray-300 animate-pulse" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-full h-12 p-4 bg-gray-300 animate-pulse" />
                  <div className="w-full h-12 p-2 bg-gray-300 animate-pulse" />
                  <div className="w-full h-12 p-2 bg-gray-300 animate-pulse" />
                  <div className="w-full h-12 p-2 bg-gray-300 animate-pulse" />
                  <div className="w-full h-12 p-2 bg-gray-300 animate-pulse" />
                  <div className="w-full h-12 p-2 bg-gray-300 animate-pulse" />
                </div>
              </div>
            ) : (
              <AppTable
                data={(data?.data as IPriceList[]) ?? []}
                columns={columns}
                manualPagination={true}
                totalDocs={data?.count}
                pageSize={100}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
          <DetailsModal
            open={!!selected}
            record={selected}
            onClose={() => setSelected(null)}
            currencyCode={
              selected ? currencyMap.get(selected.currency_id) : undefined
            }
          />
        </div>
      </div>
    );
};

export default PriceListsPage;

type DetailsModalProps = {
    open: boolean;
    record: IPriceList | null;
    onClose: () => void;
    currencyCode: string | undefined;
};

function DetailsModal({ open, record, onClose, currencyCode }: DetailsModalProps) {
    if (!open || !record) return null;

    const typeLabel =
        record.pricebook_type === "fixed_percentage"
            ? "Fixed Percentage"
            : record.pricebook_type === "per_item"
                ? "Per Item"
                : record.pricebook_type;

    const appliesTo =
        record.sales_or_purchase_type
            ? record.sales_or_purchase_type[0].toUpperCase() + record.sales_or_purchase_type.slice(1)
            : "-";

    const ROUNDING_LABEL: Record<IPriceList["rounding_type"], string> = {
        no_rounding: "No rounding",
        round_to_dollar: "Round to dollar",
        round_to_dollar_minus_01: "Round to dollar - 0.01",
        round_to_half_dollar: "Round to half-dollar",
        round_to_half_dollar_minus_01: "Round to half-dollar - 0.01",
    };

    const rounding = ROUNDING_LABEL[record.rounding_type] ?? record.rounding_type;

    return (
        <div className="fixed inset-0 z-[60]">

            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                role="dialog"
                aria-modal="true"
                className="absolute inset-0 flex items-center justify-center p-4"
            >
                <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">

                    <div className="flex items-center justify-between px-5 py-4 border-b">
                        <h2 className="text-lg font-semibold text-zinc-800">
                            {record.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs uppercase text-zinc-500">Applies To</div>
                                <div className="font-medium">{appliesTo}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase text-zinc-500">Type</div>
                                <div className="font-medium">{typeLabel}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase text-zinc-500">Rounding</div>
                                <div className="font-medium">{rounding}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase text-zinc-500">Currency</div>
                                <div className="font-medium">{currencyCode ?? "-"}</div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="text-xs uppercase text-zinc-500">Description</div>
                                <div className="font-medium whitespace-pre-wrap">
                                    {record.description || "—"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-zinc-800 mb-2">Rules</h3>

                            {record.pricebook_type === "fixed_percentage" ? (
                                <div className="rounded-lg border p-3 bg-zinc-50">
                                    <div className="text-sm">
                                        {record.is_increase ? "Markup" : "Markdown"}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border divide-y">
                                    {record.pricebook_items?.length ? (
                                        record.pricebook_items.map((it, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 text-sm">
                                                <div className="text-zinc-700">
                                                    <span className="text-zinc-500">Item ID: </span>
                                                    <span className="font-medium">{it.item_id}</span>
                                                </div>
                                                <div className="font-semibold">{Number(it.pricebook_rate).toFixed(2)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-zinc-500">No per-item rules.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600">
                            <div>
                                <span className="text-zinc-500">Status: </span>
                                <span className="font-medium">
                                    {record.status[0].toUpperCase() + record.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <span className="text-zinc-500">Created: </span>
                                <span className="font-medium">
                                    {record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}
                                </span>
                            </div>
                            <div>
                                <span className="text-zinc-500">Updated: </span>
                                <span className="font-medium">
                                    {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "-"}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex text-sm text-zinc-600 gap-4 item-center">
                <span className="text-zinc-500 ">Report Submitted by: </span>
                <p className=" font-medium">{record.createdBy.fullName}</p>
              </div>
                    </div>

                    <div className="px-5 py-3 border-t flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
