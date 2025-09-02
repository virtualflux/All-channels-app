"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import SearchableDropdown from "../ui/SearchAbleDropdown";

const SALES_OR_PURCHASE_TYPES = [
    { name: "Sales", value: "sales" },
    { name: "Purchases", value: "purchases" },
];

const PRICEBOOK_TYPES = [
    { name: "Fixed Percentage", value: "fixed_percentage" },
    { name: "Per Item", value: "per_item" },
];

const ROUNDING_TYPES = [
    { name: "No rounding", value: "no_rounding" },
    { name: "Round to dollar", value: "round_to_dollar" },
    { name: "Round to dollar - 0.01", value: "round_to_dollar_minus_01" },
    { name: "Round to half dollar", value: "round_to_half_dollar" },
    { name: "Round to half dollar - 0.01", value: "round_to_half_dollar_minus_01" },
];

type CurrencyRow = { currency_id: string; currency_code: string; currency_name?: string };
type ItemRow = { item_id: string; name: string };

type FixedPercentageState = {
    pricebook_type: "fixed_percentage";
    is_increase: boolean;
    percentage: number;
};

type PerItemState = {
    pricebook_type: "per_item";
    pricebook_items: Array<{ item_id: string; pricebook_rate: number }>;
};

type CommonState = {
    name: string;
    description?: string;
    currency_id: string;
    sales_or_purchase_type: "sales" | "purchases";
    rounding_type: (typeof ROUNDING_TYPES)[number]["value"];
};

type FormState = CommonState & (FixedPercentageState | PerItemState);

const baseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    currency_id: z.string().min(1, "Currency is required"),
    sales_or_purchase_type: z.enum(["sales", "purchases"]),
    rounding_type: z.enum([
        "no_rounding",
        "round_to_dollar",
        "round_to_dollar_minus_01",
        "round_to_half_dollar",
        "round_to_half_dollar_minus_01",
    ]),
});

const fixedPercentageSchema = z.object({
    pricebook_type: z.literal("fixed_percentage"),
    is_increase: z.boolean(),
    percentage: z
        .number({ invalid_type_error: "Percentage is required" })
        .positive("Percentage must be greater than 0")
        .max(100000, "Too large"),
});

const perItemSchema = z.object({
    pricebook_type: z.literal("per_item"),
    pricebook_items: z
        .array(
            z.object({
                item_id: z.string().min(1, "Item is required"),
                pricebook_rate: z
                    .number({ invalid_type_error: "Rate is required" })
                    .nonnegative("Rate cannot be negative"),
            })
        )
        .min(1, "Add at least one item"),
});

const formSchema = z.discriminatedUnion("pricebook_type", [
    baseSchema.merge(fixedPercentageSchema),
    baseSchema.merge(perItemSchema),
]);

async function fetchCurrencies() {
    const res = await axios.get<{ data: CurrencyRow[] }>("/api/zoho/currencies");
    return res.data.data ?? [];
}

async function fetchItems() {
    const res = await axios.get<{ data: ItemRow[] }>("/api/zoho/items");
    return res.data.data ?? [];
}

export default function PriceListForm() {
    const { data: currencies = [] } = useQuery({ queryKey: ["currencies"], queryFn: fetchCurrencies });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: fetchItems });

    const formik = useFormik<FormState>({
        initialValues: {
            name: "",
            description: "",
            currency_id: "",
            sales_or_purchase_type: "sales",
            rounding_type: "no_rounding",
            pricebook_type: "fixed_percentage",
            is_increase: true,
            percentage: 0,

        } as FormState,
        validationSchema: toFormikValidationSchema(formSchema),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                // Build payload for Zoho Inventory's /pricebooks
                // Only include fields relevant to selected type
                const common = {
                    name: values.name,
                    description: values.description || undefined,
                    currency_id: values.currency_id,
                    sales_or_purchase_type: values.sales_or_purchase_type,
                    rounding_type: values.rounding_type,
                };

                const payload =
                    values.pricebook_type === "fixed_percentage"
                        ? {
                            ...common,
                            pricebook_type: "fixed_percentage",
                            is_increase: values.is_increase,
                            percentage: values.percentage,
                        }
                        : {
                            ...common,
                            pricebook_type: "per_item",
                            is_increase: true, // Zoho ignores this for per_item but you can omit
                            pricebook_items: values.pricebook_items,
                        };

                await axios.post("/api/zoho/pricebooks", payload, {
                    headers: { "Content-Type": "application/json" },
                });

                toast.success("Price list created");
                resetForm();
            } catch (err: any) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create price list";
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Mode switches keep values tidy
    const switchToFixed = () =>
        formik.setValues({
            ...formik.values,
            pricebook_type: "fixed_percentage",
            is_increase: true,
            percentage: formik.values.pricebook_type === "fixed_percentage" ? formik.values.percentage : 0,
            // drop per-item rows when switching (optional)
        } as FormState);

    const switchToPerItem = () =>
        formik.setValues({
            ...formik.values,
            pricebook_type: "per_item",
            pricebook_items:
                formik.values.pricebook_type === "per_item"
                    ? (formik.values as any).pricebook_items
                    : [],
            // percentage/is_increase not sent in this mode
        } as FormState);

    const addItemRow = () => {
        if (formik.values.pricebook_type !== "per_item") return;
        formik.setFieldValue("pricebook_items", [
            ...((formik.values as any).pricebook_items ?? []),
            { item_id: "", pricebook_rate: 0 },
        ]);
    };

    const removeItemRow = (idx: number) => {
        if (formik.values.pricebook_type !== "per_item") return;
        const rows = [...((formik.values as any).pricebook_items ?? [])];
        rows.splice(idx, 1);
        formik.setFieldValue("pricebook_items", rows);
    };

    const currencyOptions = useMemo(
        () =>
            currencies.map((c) => ({
                name: `${c.currency_code}${c.currency_name ? ` — ${c.currency_name}` : ""}`,
                value: c.currency_id,
            })),
        [currencies]
    );

    const itemOptions = useMemo(
        () => items.map((i) => ({ name: i.name, value: i.item_id })),
        [items]
    );

    const isFixed = formik.values.pricebook_type === "fixed_percentage";
    const isPerItem = formik.values.pricebook_type === "per_item";

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Create Price List</h1>
                        <p className="text-gray-600">
                            Configure a sales or purchase price list (fixed percentage or per-item).
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">

                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-4 py-3 border rounded-lg focus:border-teal-500 ${formik.touched.name && formik.errors.name ? "border-red-500" : "border-zinc-300"
                                    }`}
                                placeholder="e.g., Summer Sale 2025"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.name as string}</div>
                            )}
                        </div>

                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Applies To</label>
                            <SearchableDropdown
                                options={SALES_OR_PURCHASE_TYPES}
                                value={formik.values.sales_or_purchase_type}
                                onSelect={(opt) => formik.setFieldValue("sales_or_purchase_type", opt.value)}
                                placeholder="Select type"
                            />
                            {formik.touched.sales_or_purchase_type && formik.errors.sales_or_purchase_type && (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.sales_or_purchase_type as string}</div>
                            )}
                        </div>

                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Currency</label>
                            <SearchableDropdown
                                options={currencyOptions}
                                value={formik.values.currency_id}
                                onSelect={(opt) => formik.setFieldValue("currency_id", opt.value)}
                                placeholder="Select currency"
                            />
                            {formik.touched.currency_id && formik.errors.currency_id && (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.currency_id as string}</div>
                            )}
                        </div>

                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Rounding</label>
                            <SearchableDropdown
                                options={ROUNDING_TYPES}
                                value={formik.values.rounding_type}
                                onSelect={(opt) => formik.setFieldValue("rounding_type", opt.value)}
                                placeholder="Select rounding"
                            />
                        </div>

                        <div className="md:col-span-full">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={formik.values.description || ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-4 py-3 border rounded-lg focus:border-teal-500 ${formik.touched.description && formik.errors.description
                                    ? "border-red-500"
                                    : "border-zinc-300"
                                    }`}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="md:col-span-full">
                            <div className="inline-flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={switchToFixed}
                                    className={`px-3 py-2 rounded-md text-sm ${isFixed ? "bg-white shadow" : "opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    Fixed Percentage
                                </button>
                                <button
                                    type="button"
                                    onClick={switchToPerItem}
                                    className={`px-3 py-2 rounded-md text-sm ${isPerItem ? "bg-white shadow" : "opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    Per Item
                                </button>
                            </div>
                        </div>

                        {isFixed && (
                            <>
                                <div className="md:col-span-6">
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Adjustment</label>
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="is_increase"
                                                checked={true}
                                                onChange={() => formik.setFieldValue("is_increase", true)}
                                            />
                                            <span>Markup</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="is_increase"
                                                checked={false}
                                                onChange={() => formik.setFieldValue("is_increase", false)}
                                            />
                                            <span>Markdown</span>
                                        </label>
                                    </div>
                                </div>

                                {formik.values?.pricebook_type == "per_item" && <div className="md:col-span-6">
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Percentage</label>
                                    <input
                                        id="percentage"
                                        name="percentage"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={0}
                                        onChange={(e) => formik.setFieldValue("percentage", Number(e.target.value))}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 border rounded-lg focus:border-teal-500 ${(formik.touched as any).percentage && (formik.errors as any).percentage
                                            ? "border-red-500"
                                            : "border-zinc-300"
                                            }`}
                                        placeholder="e.g., 10"
                                    />
                                    {(formik.touched as any).percentage && (formik.errors as any).percentage && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {(formik.errors as any).percentage as string}
                                        </div>
                                    )}
                                </div>}
                            </>
                        )}

                        {isPerItem && (
                            <div className="md:col-span-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-zinc-800">Item rates</h3>
                                    <button
                                        type="button"
                                        onClick={addItemRow}
                                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {((formik.values as any).pricebook_items ?? []).map(
                                        (row: { item_id: string; pricebook_rate: number }, idx: number) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2">
                                                <div className="col-span-7">
                                                    <SearchableDropdown
                                                        options={itemOptions}
                                                        value={row.item_id}
                                                        onSelect={(opt) => {
                                                            const rows = [...(formik.values as any).pricebook_items];
                                                            rows[idx] = { ...rows[idx], item_id: opt.value };
                                                            formik.setFieldValue("pricebook_items", rows);
                                                        }}
                                                        placeholder="Select item"
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={row.pricebook_rate}
                                                        onChange={(e) => {
                                                            const rows = [...(formik.values as any).pricebook_items];
                                                            rows[idx] = { ...rows[idx], pricebook_rate: Number(e.target.value) };
                                                            formik.setFieldValue("pricebook_items", rows);
                                                        }}
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        placeholder="Custom rate"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItemRow(idx)}
                                                        className="text-red-600 hover:bg-red-50 rounded-md px-2 py-1"
                                                        aria-label="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {formik.values.pricebook_type === "per_item" &&
                                    (formik.errors as any).pricebook_items && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {(formik.errors as any).pricebook_items as string}
                                        </div>
                                    )}
                            </div>
                        )}

                        <div className="md:col-span-full flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => formik.resetForm()}
                                className="px-5 py-2.5 border rounded-lg text-zinc-700 hover:bg-zinc-50"
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-75"
                            >
                                {formik.isSubmitting ? "Creating..." : "Create Price List"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
