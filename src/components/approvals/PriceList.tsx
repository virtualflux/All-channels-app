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
    round_to_dollar: "Round to dollar",
    round_to_dollar_minus_01: "Round to dollar - 0.01",
    round_to_half_dollar: "Round to half-dollar",
    round_to_half_dollar_minus_01: "Round to half-dollar - 0.01",
};

type CurrencyRow = { currency_id: string; currency_code: string; currency_name?: string };


async function fetchCurrencies() {
    const res = await axios.get<{ data: CurrencyRow[] }>("/api/zoho/currencies");
    return res.data.data ?? [];
}


const PriceListsPage = ({ currencies }: { currencies: ZohoCurrencies["currencies"] }) => {
    const fetchPriceLists = async () => {
        try {
            const res = await axios.get<{ message: string; data: IPriceList[] }>(
                "/api/db/pricelists"
            );
            return res.data.data;
        } catch {
            toast.error("Error fetching price lists. Please refresh.");
            return [];
        }
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["pricelists"],
        queryFn: fetchPriceLists,
    });

    // const { data: currencies = [] } = useQuery({ queryKey: ["currencies"], queryFn: fetchCurrencies });

    const [busyId, setBusyId] = useState<string | null>(null);

    type UpdateStatusPayload = { status: IPriceList["status"] };

    const updateStatus = async (id: string, status: IPriceList["status"]) => {
        setBusyId(id);
        try {
            await axios.put(`/api/db/pricelists/${id}`, { status } as UpdateStatusPayload);
            toast.success(status === "approved" ? "Price list approved" : "Price list rejected");
            refetch();
        } catch (e) {
            toast.error("Failed to update price list");
        } finally {
            setBusyId(null);
        }
    };

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
                    return v === "fixed_percentage" ? "Fixed %" : v === "per_item" ? "Per Item" : v || "-";
                },
            },

            {
                accessorKey: "rounding_type",
                header: "Rounding",
                cell: (info: any) => {
                    const val = info.getValue() as IPriceList["rounding_type"]
                    return ROUNDING_LABEL[val] ?? "-"
                },
            },
            {
                accessorKey: "currency_id",
                header: "Currency",
                cell: (info: any) => {
                    const currency = currencies.find((item) => item.currency_id == info.getValue())

                    return currency?.currency_code
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls[status]}`}>
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
                        return <span className="text-gray-500 text-center text-sm">No actions</span>;
                    }

                    return (
                        <div className="flex space-x-2">
                            <button
                                disabled={loading}
                                onClick={() => approve(row._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Price Lists</h1>
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
                        <AppTable data={(data as IPriceList[]) ?? []} columns={columns} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceListsPage;
