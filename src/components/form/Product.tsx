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
import { ProductType } from "@/app/api/db/products/productSchema";
import { InventoryChartAccounts } from "@/types/zoho-inventory-chartaccounts.type";

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
    queryFn: (ctx) => fetchAccounts(),
  });

  const formik = useFormik<
    Omit<
      ProductType,
      "approved" | "ignore_auto_number_generation" | "status" | "createdBy"
    >
  >({
    initialValues: {
      name: "",
      unit: "",
      description: "",
      selling_price: 0,
      sales_account: "",
      sales_description: "",
      sales_tax: "",
      cost_price: 0,
      purchase_account: "",
      purchase_description: "",
      purchase_tax: "",
      returnable_item: false,
    },
    // validationSchema: toFormikValidationSchema(customerSchema),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const apiData = {
          ...values,
        };
        console.log("Submitting customer values:", apiData);

        await axios
          .post("/api/db/products", apiData)
          .then((res) => {
            console.log(res);
            toast.success("Product created successfully");
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

              {/* returnable item checkbox */}
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

            <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 mb-1"
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
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder="Enter a description for this account"
              />
              {formik.touched.description && formik.errors.description ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.description}
                </div>
              ) : null}
            </div>

            {/* -------------PURCHASE INFORMATION--------------- */}
            <article className="col-span-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                Sales Information
              </h1>

              {/* selling price */}
              <label
                htmlFor="selling_price"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Selling Price
              </label>
              <input
                id="selling_price"
                name="selling_price"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.selling_price}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.selling_price && formik.errors.selling_price
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.selling_price && formik.errors.selling_price ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.selling_price}
                </div>
              ) : null}

              {/* account */}
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Account
              </label>
              <SearchableDropdown
                options={(data ?? [])?.map(item => ({ name: item.account_name, value: item.account_id }))}
                value={formik.values.sales_account}
                onSelect={(data) => {
                  formik.setFieldValue("sales_account", data.value);
                }}
                placeholder="Select sales account"
                className=""
              />
              {formik.touched.unit && formik.errors.unit ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.unit}
                </div>
              ) : null}

              {/* description */}
              <label
                htmlFor="sales_description"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Description
              </label>
              <textarea
                id="sales_description"
                name="sales_description"
                rows={3}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.sales_description}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.sales_description &&
                  formik.errors.sales_description
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.sales_description &&
                formik.errors.sales_description ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.sales_description}
                </div>
              ) : null}

              {/* tax */}
              {/* <label
                htmlFor="sales_tax"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Tax
              </label>
              <SearchableDropdown
                options={ACCOUNT_TYPES}
                value={formik.values.sales_tax || ""}
                onSelect={(data) => {
                  formik.setFieldValue("sales_tax", data.value);
                }}
                placeholder="Select a tax"
                className=""
              />
              {formik.touched.sales_tax && formik.errors.sales_tax ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.sales_tax}
                </div>
              ) : null} */}
            </article>

            <article className="col-span-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                Purchase Information
              </h1>

              {/* cost price */}
              <label
                htmlFor="cost_price"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Cost Price
              </label>
              <input
                id="cost_price"
                name="cost_price"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.cost_price}
                className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.cost_price && formik.errors.cost_price
                  ? "border-red-500"
                  : "border-zinc-300"
                  }`}
                placeholder=""
              />
              {formik.touched.cost_price && formik.errors.cost_price ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.cost_price}
                </div>
              ) : null}

              {/* account */}
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Account
              </label>
              <SearchableDropdown
                options={(data ?? [])?.map(item => ({ name: item.account_name, value: item.account_id }))}
                value={formik.values.purchase_account}
                onSelect={(data) => {
                  formik.setFieldValue("purchase_account", data.value);
                }}
                placeholder="Select purchase account"
                className=""
              />
              {formik.touched.unit && formik.errors.unit ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.unit}
                </div>
              ) : null}

              {/* description */}
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

              {/* tax */}
              {/* <label
                htmlFor="purchase_tax"
                className="block text-sm font-medium text-zinc-700 mb-1 mt-2"
              >
                Tax
              </label>
              <SearchableDropdown
                options={ACCOUNT_TYPES}
                value={formik.values.purchase_tax || ""}
                onSelect={(data) => {
                  formik.setFieldValue("purchase_tax", data.value);
                }}
                placeholder="Select a tax"
                className=""
              />
              {formik.touched.purchase_tax && formik.errors.purchase_tax ? (
                <div className="mt-1 text-sm text-red-600">
                  {formik.errors.purchase_tax}
                </div>
              ) : null} */}
            </article>

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
