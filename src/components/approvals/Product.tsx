"use client";
import { useMemo, useState } from "react";
import AppTable from "../ui/AppTable";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { currencyFmt } from "@/lib/utils";

// If you already have a Product type, import it instead.
// import type { ProductType } from "@/app/api/db/products/productSchema";
type IProduct = {
    _id: string;
    name: string;
    unit: string;
    description?: string;
    rate: number;                 // selling price
    account_id: string;           // sales account id
    purchase_rate: number;
    purchase_account_id: string;
    purchase_description?: string;
    track_inventory: boolean;
    inventory_valuation_method?: "fifo" | "wac";
    reorder_level?: number;
    inventory_account_id?: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: string;
};



const ProductsPage = () => {
    const fetchProducts = async () => {
        try {
            const res = await axios.get<{ message: string; data: IProduct[] }>(
                "/api/db/products"
            );
            return res.data.data;
        } catch (error) {
            toast.error("Error fetching products. Please refresh the browser.");
            return [];
        }
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const [busyId, setBusyId] = useState<string | null>(null);

    type UpdateStatusPayload = { status: "pending" | "approved" | "rejected" };

    const updateStatus = async (id: string, status: IProduct["status"]) => {
        setBusyId(id);
        const body: UpdateStatusPayload = { status };
        try {
            await axios.put(`/api/db/products/${id}`, body);
            toast.success(
                status === "approved" ? "Product approved" : "Product rejected"
            );
            refetch();
        } catch {
            toast.error("Failed to update product");
        } finally {
            setBusyId(null);
        }
    };

    const approveProduct = (id: string) => updateStatus(id, "approved");
    const rejectProduct = (id: string) => updateStatus(id, "rejected");

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: "unit",
                header: "Unit",
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: "rate",
                header: "Selling Price",
                cell: (info: any) => currencyFmt.format(Number(info.getValue() ?? 0)),
            },
            {
                accessorKey: "purchase_rate",
                header: "Cost Price",
                cell: (info: any) => currencyFmt.format(Number(info.getValue() ?? 0)),
            },
            {
                accessorKey: "track_inventory",
                header: "Tracking",
                cell: (info: any) => {
                    const v = info.getValue() as boolean;
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${v ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {v ? "Yes" : "No"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "inventory_valuation_method",
                header: "Valuation",
                cell: (info: any) => info.getValue() ?? "-",
            },
            {
                accessorKey: "reorder_level",
                header: "Reorder Level",
                cell: (info: any) => (info.getValue() ?? "-"),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: (info: any) => {
                    const status = info.getValue() as IProduct["status"];
                    const statusColors = {
                        pending: "bg-yellow-100 text-yellow-800",
                        approved: "bg-green-100 text-green-800",
                        rejected: "bg-red-100 text-red-800",
                    };
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: (info: any) => {
                    const product = info.row.original as IProduct;
                    const loading = busyId === product._id;

                    if (product.status !== "pending") {
                        return (
                            <span className="text-gray-500 text-center text-sm">
                                No actions
                            </span>
                        );
                    }

                    return (
                        <div className="flex space-x-2">
                            <button
                                disabled={loading}
                                onClick={() => approveProduct(product._id)}
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
                                onClick={() => rejectProduct(product._id)}
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
                        Manage Products
                    </h1>
                    <p className="text-gray-600">
                        Approve or reject products before they go live
                    </p>
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
                        <AppTable data={(data as IProduct[]) ?? []} columns={columns} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
