"use client"
import { useFormik } from 'formik';
import SearchableDropdown from '../ui/SearchAbleDropdown';
import { AccountType } from '@/app/api/db/accounts/schema';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

export const ACCOUNT_TYPES: { name: string; value: string }[] = [
    { name: 'Cash (Asset)', value: 'cash' },
    { name: 'Bank (Asset)', value: 'bank' },
    { name: 'Fixed Asset (Asset)', value: 'fixed_asset' },
    { name: 'Stock (Asset)', value: 'stock' },                      // see note
    { name: 'Accounts Receivable (Asset)', value: 'accounts_receivable' },
    { name: 'Deferred Tax Asset (Asset)', value: 'deferred_tax_asset' }, // see note
    { name: 'Other Asset (Asset)', value: 'other_asset' },
    { name: 'Other Current Assets (Asset)', value: 'other_current_asset' }, // singular "asset"
    { name: 'Payment Clearing (Asset)', value: 'payment_clearing' },  // see note

    { name: 'Accounts Payable (Liability)', value: 'accounts_payable' },
    { name: 'Deferred Tax Liability (Liability)', value: 'deferred_tax_liability' }, // see note
    { name: 'Credit Card (Liability)', value: 'credit_card' },
    { name: 'Long Term Liability (Liability)', value: 'long_term_liability' },
    { name: 'Other Liability (Liability)', value: 'other_liability' },
    { name: 'Other Current Liability (Liability)', value: 'other_current_liability' },
    { name: 'Overseas Tax Payable (Liability)', value: 'overseas_tax_payable' }, // see note

    { name: 'Equity', value: 'equity' },

    { name: 'Income', value: 'income' },
    { name: 'Other Income', value: 'other_income' },

    { name: 'Expense', value: 'expense' },
];

const LedgerForm = () => {
    // const { mutate, error, isPending, isSuccess } = useMutation({
    //     mutationFn: async (data: Omit<AccountType, "approvedAt">) => {


    //     },
    // });
    const formik = useFormik<Omit<AccountType, "status">>({
        initialValues: {
            account_name: '',
            account_code: '',
            account_type: '',
            description: '',
            createdBy: "" as any
        },

        onSubmit: async (values, { setSubmitting, resetForm }) => {

            await axios.post("/api/db/accounts", values)
                .then((res) => {
                    console.log(res)
                    toast.success("Account created successfully")
                })
                .catch(error => {
                    if (axios.isAxiosError(error)) {
                        const message = error.response?.data?.message ||
                            error.message
                        toast.error(message)
                        return
                    }
                    toast.error("Could not submit form , Please try again")

                });

            resetForm();
        },
    });

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-zinc-800 mb-2">Create Ledger Account</h1>
                        <p className="text-zinc-600">Add a new account to your chart of accounts</p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-4 space-x-2 grid-cols-8 grid">
                            <div className=' col-span-4'>
                                <label htmlFor="account_name" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Account Name
                                </label>
                                <input
                                    id="account_name"
                                    name="account_name"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.account_name}
                                    className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.account_name && formik.errors.account_name
                                        ? 'border-red-500'
                                        : 'border-zinc-300'
                                        }`}
                                    placeholder="e.g., Operating Bank Account"
                                />
                                {formik.touched.account_name && formik.errors.account_name ? (
                                    <div className="mt-1 text-sm text-red-600">{formik.errors.account_name}</div>
                                ) : null}
                            </div>

                            <div className=' col-span-4'>
                                <label htmlFor="account_code" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Account Code
                                </label>
                                <input
                                    id="account_code"
                                    name="account_code"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.account_code}
                                    className={`w-full px-4 py-3 border rounded-lg  focus:border-teal-500 ${formik.touched.account_code && formik.errors.account_code
                                        ? 'border-red-500'
                                        : 'border-zinc-300'
                                        }`}
                                    placeholder="e.g., 1001"
                                />
                                {formik.touched.account_code && formik.errors.account_code ? (
                                    <div className="mt-1 text-sm text-red-600">{formik.errors.account_code}</div>
                                ) : null}
                            </div>
                            <div className=' col-span-full'>
                                <label htmlFor="account_type" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Account Type
                                </label>
                                <SearchableDropdown
                                    options={ACCOUNT_TYPES}
                                    value={formik.values.account_type}
                                    onSelect={(data) => { formik.setFieldValue("account_type", data.value) }}
                                    placeholder="Select account type"
                                    className=''
                                />
                                {formik.touched.account_type && formik.errors.account_type ? (
                                    <div className="mt-1 text-sm text-red-600">{formik.errors.account_type}</div>
                                ) : null}
                            </div>
                            <div className='col-span-full'>
                                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
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
                                        ? 'border-red-500'
                                        : 'border-zinc-300'
                                        }`}
                                    placeholder="Enter a description for this account"
                                />
                                {formik.touched.description && formik.errors.description ? (
                                    <div className="mt-1 text-sm text-red-600">{formik.errors.description}</div>
                                ) : null}
                            </div>

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
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LedgerForm;