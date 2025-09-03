"use client";
import { z } from "zod";
import axios from "axios";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { ACCOUNT_TYPES } from "./Ledger";
import { UNIT_TYPES } from "@/lib/constants";
import { IAccount } from "@/types/account.type";
import { useQuery } from "@tanstack/react-query";
import SearchableDropdown from "../ui/SearchAbleDropdown";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ProductType } from "@/app/api/db/products/schema";
import { InventoryChartAccounts } from "@/types/zoho-books-chartaccounts.type";

const ProductForm = () => {
  const fetchAccounts = async () => {
    try {
      const res = await axios.get<{ message: string; data: InventoryChartAccounts["chartofaccounts"] }>(
        `/api/zoho/accounts`
      );

      return res.data.data;
    } catch (error: any) {
      let message = "Error fetching accounts try refresh the browser please"
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data)
        message = error.response?.data.message
      }

      toast.error(message);
      return [];
    }
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const formik = useFormik<
    Omit<
      ProductType,
      "product_type" | "ignore_auto_number_generation" | "status" | "createdBy"
    >
  >({
    initialValues: {
      name: "",
      unit: "",
      description: "",
      rate: 0,
      account_id: "",
      purchase_rate: 0,
      purchase_account_id: "",
      purchase_description: "",
      track_inventory: true,
      inventory_valuation_method: "" as any,
      reorder_level: 1,
      inventory_account_id: "",
      returnable_item: true,
    },
    // validationSchema: toFormikValidationSchema(customerSchema),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const apiData = {
          ...values,
        };
        // console.log("Submitting customer values:", apiData);

        await axios
          .post("/api/db/products", apiData)
          .then((res) => {
            console.log(res);
            toast.success("Product requesting approval");
          })
          .catch((error) => {
            if (axios.isAxiosError(error)) {
              const message = error.response?.data?.message || error.message;
              toast.error(message);
              return;
            }
            toast.error("Could not submit form , Please try again");
          });

        resetForm();
      } catch (error) {
        console.error("Error creating customer:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 ">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Create Product
            </h1>
            <p className="text-gray-600">Add a new product to your system</p>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
            onSubmit={formik.handleSubmit}
          >
            <div className="col-span-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder="e.g., Product Name"
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.name}
                </div>
              ) : null}

              <div className="flex items-center mt-4">
                <input
                  id="returnable_item"
                  name="returnable_item"
                  type="checkbox"
                  checked={formik.values.returnable_item}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label
                  htmlFor="returnable_item"
                  className="ml-2 block text-sm font-medium text-zinc-700"
                >
                  Returnable Item
                </label>
              </div>
              {formik.touched.returnable_item &&
                formik.errors.returnable_item ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.returnable_item}
                </div>
              ) : null}
            </div>

            <div className="col-span-full">
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                Unit
              </label>
              <SearchableDropdown
                options={UNIT_TYPES}
                value={formik.values.unit}
                onSelect={(data) => {
                  formik.setFieldValue("unit", data.value);
                }}
                placeholder="Select unit"
                className=""
              />
              {formik.touched.unit && formik.errors.unit ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.unit}
                </div>
              ) : null}
            </div>
            <article className="col-span-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                Sales Information
              </h1>

              {/* selling price */}
              <label
                htmlFor="rate"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Selling Price
              </label>
              <input
                id="rate"
                name="rate"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.rate}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.rate && formik.errors.rate
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.rate && formik.errors.rate ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.rate}
                </div>
              ) : null}

              <label
                htmlFor="account_id"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Account
              </label>
              <SearchableDropdown
                options={(data ?? []).filter(acc => acc.account_type === "income").map(item => ({ name: item.account_name, value: item.account_id }))}
                value={formik.values.account_id}
                onSelect={(data) => {
                  formik.setFieldValue("account_id", data.value);
                }}
                placeholder="Select sales account"
                className=""
              />
              {formik.touched.account_id && formik.errors.account_id ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.account_id}
                </div>
              ) : null}

              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.description &&
                  formik.errors.description
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.description &&
                formik.errors.description ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.description}
                </div>
              ) : null}


            </article>

            <article className="col-span-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                Purchase Information
              </h1>

              <label
                htmlFor="purchase_rate"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Cost Price
              </label>
              <input
                id="purchase_rate"
                name="purchase_rate"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.purchase_rate}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.purchase_rate && formik.errors.purchase_rate
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.purchase_rate && formik.errors.purchase_rate ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.purchase_rate}
                </div>
              ) : null}

              <label
                htmlFor="purchase_account_id"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Account
              </label>
              <SearchableDropdown
                options={(data ?? []).filter(acc => acc.account_type === "cost_of_goods_sold").map(item => ({ name: item.account_name, value: item.account_id }))}
                value={formik.values.purchase_account_id}
                onSelect={(data) => {
                  formik.setFieldValue("purchase_account_id", data.value);
                }}
                placeholder="Select purchase account"
                className=""
              />
              {formik.touched.purchase_account_id && formik.errors.purchase_account_id ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.purchase_account_id}
                </div>
              ) : null}

              <label
                htmlFor="purchase_description"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Description
              </label>
              <textarea
                id="purchase_description"
                name="purchase_description"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.purchase_description}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.purchase_description &&
                  formik.errors.purchase_description
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.purchase_description &&
                formik.errors.purchase_description ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.purchase_description}
                </div>
              ) : null}


            </article>
            <div className="flex items-center mt-4 col-span-6">
              <input
                id=""
                name="track_inventory"
                type="checkbox"
                checked={formik.values.track_inventory}
                onChange={formik.handleChange}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label
                htmlFor="track_inventory"
                className="ml-2 block text-sm font-medium text-zinc-700"
              >
                Track Inventory
              </label>
            </div>
            {formik.touched.track_inventory &&
              formik.errors.track_inventory ? (
              <div className="mt-1 text-sm text-red-600">
                {formik.errors.track_inventory}
              </div>
            ) : null}

            {formik.values.track_inventory && (<div className="w-full col-span-full grid grid-cols-6 gap-4">
              <div className=" col-span-3">
                <label
                  htmlFor="inventory_account_id"
                  className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
                >
                  Inventory Account
                </label>
                <SearchableDropdown
                  options={(data ?? []).filter(acc => acc.account_type === "stock").map(item => ({ name: item.account_name, value: item.account_id }))}
                  value={formik.values.inventory_account_id ?? ""}
                  onSelect={(data) => {
                    formik.setFieldValue("inventory_account_id", data.value);
                  }}
                  placeholder="Select purchase account"
                  className=""
                />
                {formik.touched.inventory_account_id && formik.errors.inventory_account_id ? (
                  <div className="mt-1 text-sm text-red-600">
                    {formik.errors.inventory_account_id}
                  </div>
                ) : null}</div>
              <div className=" col-span-3"> <label
                htmlFor="inventory_valuation_method"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Inventory Valuation Method
              </label>
                <SearchableDropdown
                  options={[{ name: "FIFO(First In First Out)", value: "fifo" }, { name: "WAC(Weighted Average Costing)", value: "wac" }]}
                  value={formik.values.inventory_valuation_method ?? ""}
                  onSelect={(data) => {
                    formik.setFieldValue("inventory_valuation_method", data.value);
                  }}
                  placeholder="Select valuation method"
                  className=""
                />
                {formik.touched.inventory_valuation_method && formik.errors.inventory_valuation_method ? (
                  <div className="mt-1 text-sm text-red-600">
                    {formik.errors.inventory_valuation_method}
                  </div>
                ) : null}</div>
              <div className="col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 mb-1"
                >
                  Reorder Point
                </label>
                <input
                  id="reorder_level"
                  name="reorder_level"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.reorder_level}
                  className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.reorder_level && formik.errors.reorder_level
                    ? "border-red-500"
                    : "border-zinc-300"
                    }`}
                  placeholder="e.g., Product Name"
                />
                {formik.touched.reorder_level && formik.errors.reorder_level ? (
                  <div className="mt-1 text-sm text-red-600">
                    {formik.errors.reorder_level}
                  </div>
                ) : null}


              </div>

            </div>)}

            <div className="flex justify-end space-x-4 pt-4 col-span-full">
              <button
                type="button"
                onClick={() => formik.resetForm()}
                className="px-5 py-2.5 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 focus:outline-none  focus:ring-offset-2"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="px-5 py-2.5 bg-teal-600 border border-transparent rounded-lg text-white font-medium hover:bg-teal-700 focus:outline-none  focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? (
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
