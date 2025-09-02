"use client"
import { useFormik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import SearchableDropdown from '../ui/SearchAbleDropdown';
import { contactPersonSchema, customerSchema } from '@/app/api/db/customers/schema';
import { LocalStorageHelper } from '@/lib/LocalStorageHelper';
import axios from 'axios';
import { IAccount } from '@/types/account.type';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const CUSTOMER_SUB_TYPES = [
    { name: "Individual", value: "individual" },
    { name: "Business", value: "business" },
];


type ContactPersonType = z.infer<typeof contactPersonSchema>



type CustomerType = z.infer<typeof customerSchema>

type ContactPersonField = keyof ContactPersonType

const CustomerForm = () => {

    const fetchAccounts = async () => {
        try {
            const res = await axios.get<{ message: string; data: IAccount[] }>("/api/db/accounts",)

            return res.data.data
        } catch (error) {
            toast.error("Error fetching accounts try refresh the browser please")
            return []
        }
    }
    const { data, isLoading, error } = useQuery({ queryKey: ["accounts"], queryFn: fetchAccounts })


    const formik = useFormik<Omit<CustomerType, "approved" | "ignore_auto_number_generation" | "status" | "createdBy">>({
        initialValues: {
            contact_type: 'customer',
            customer_sub_type: "individual",
            contact_persons: [{ first_name: '', last_name: '', email: '', phone: '', is_primary_contact: true }],
            company_name: '',
            contact_name: '',
            account_id: "",
            // contact_number: ''
        },
        // validationSchema: toFormikValidationSchema(customerSchema),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const apiData = {
                    ...values,
                    contact_persons: values.contact_persons.map(person => ({
                        ...person,
                        ...(person.phone ? {} : { phone: undefined })
                    }))
                };
                console.log('Submitting customer values:', apiData);

                await axios.post("/api/db/customers", apiData)
                    .then((res) => {
                        console.log(res)
                        toast.success("Customer created successfully")
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
            } catch (error) {
                console.error('Error creating customer:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleSelectAccount = (data: {
        name: string;
        value: any;
    }) => {
        formik.setFieldValue("account_id", data.value)
        return
    }

    // const addContactPerson = () => {
    //     formik.setFieldValue('contact_persons', [
    //         ...formik.values.contact_persons,
    //         { first_name: '', last_name: '', email: '', phone: '' }
    //     ]);
    // };

    // const removeContactPerson = (index: number) => {
    //     const contacts = [...formik.values.contact_persons];
    //     contacts.splice(index, 1);
    //     formik.setFieldValue('contact_persons', contacts);
    // };


    const handleContactPersonChange = <
        K extends ContactPersonField
    >(index: number, field: K, value: ContactPersonType[K]) => {
        const contacts = [...formik.values.contact_persons];
        contacts[index][field] = value;
        formik.setFieldValue('contact_persons', contacts);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 ">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Customer</h1>
                        <p className="text-gray-600">Add a new customer to your system</p>
                    </div>

                    <form className='grid grid-cols-1 md:grid-cols-12 gap-4' onSubmit={formik.handleSubmit}>

                        <div className="col-span-full">
                            <label htmlFor="customer_sub_type" className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Type <span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                            </label>
                            <select
                                id="customer_sub_type"
                                name="customer_sub_type"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.customer_sub_type}
                                className={`w-1/2 p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.customer_sub_type && formik.errors.customer_sub_type
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select customer type</option>
                                {CUSTOMER_SUB_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.customer_sub_type && formik.errors.customer_sub_type ? (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.customer_sub_type}</div>
                            ) : null}


                        </div>
                        <div className='col-span-6'>
                            <label htmlFor="contact_name" className=" block text-sm font-medium text-gray-700 mb-1">
                                Contact Name <span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                            </label>
                            <input
                                id="contact_name"
                                name="contact_name"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.contact_name}
                                className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.contact_name && formik.errors.contact_name
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="e.g., John Smith"
                            />
                            {formik.touched.contact_name && formik.errors.contact_name ? (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.contact_name}</div>
                            ) : null}
                        </div>
                        {(
                            <div className='col-span-6'>
                                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name <span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                                </label>
                                <input
                                    id="company_name"
                                    name="company_name"
                                    type="text"
                                    onChange={formik.handleChange}
                                    value={formik.values.company_name}
                                    className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.company_name && formik.errors.company_name
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., ABC Corporation"
                                />
                                {formik.touched.company_name && formik.errors.company_name ? (
                                    <div className="mt-1 text-sm text-red-600">{formik.errors.company_name}</div>
                                ) : null}
                            </div>
                        )}

                        <div className='col-span-full'>
                            <label htmlFor="account_type" className="block text-sm font-medium text-zinc-700 mb-1">
                                Account <span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                            </label>
                            <SearchableDropdown
                                options={(data ?? [])!.map(item => ({ name: item.account_name, value: item._id }))}
                                isLoading={isLoading}
                                value={formik.values.account_id}
                                onSelect={handleSelectAccount}
                                placeholder="Select an account"
                                className=''
                            />
                            {formik.touched.account_id && formik.errors.account_id ? (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.account_id}</div>
                            ) : null}
                        </div>



                        <div className='col-span-full'>
                            {/* <div className="flex justify-between items-center mb-4 w-full">
                                <h3 className="text-lg font-medium text-gray-800">Contact Persons <span className=' text-red-500 text-xs inline-block ml-1'>*</span></h3>
                                <button
                                    type="button"
                                    onClick={addContactPerson}
                                    className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                >
                                    + Add Contact Person
                                </button>
                            </div> */}

                            {formik.values.contact_persons.map((person, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                    {/* <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-700">Contact Person {index + 1}</h4>
                                        {formik.values.contact_persons.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeContactPerson(index)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div> */}

                                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name <span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={person.first_name}
                                                onChange={(e) => handleContactPersonChange(index, 'first_name', e.target.value)}

                                                className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.contact_persons?.[index]?.first_name &&
                                                    formik.errors.contact_persons?.[index].toString()
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                                    }`}
                                                placeholder="First name"
                                            />
                                            {formik.touched.contact_persons?.[index]?.first_name &&
                                                formik.errors.contact_persons?.[index]?.toString() && (
                                                    <div className="mt-1 text-sm text-red-600">
                                                        {formik.errors.contact_persons[index].toString()}
                                                    </div>
                                                )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name<span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={person.last_name}
                                                onChange={(e) => handleContactPersonChange(index, 'last_name', e.target.value)}

                                                className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.contact_persons?.[index]?.last_name &&
                                                    formik.errors.contact_persons?.[index]?.toString()
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                                    }`}
                                                placeholder="Last name"
                                            />
                                            {formik.touched.contact_persons?.[index]?.toString() &&
                                                formik.errors.contact_persons?.[index]?.toString() && (
                                                    <div className="mt-1 text-sm text-red-600">
                                                        {formik.errors.contact_persons[index].toString()}
                                                    </div>
                                                )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email<span className=' text-red-500 text-xs inline-block ml-1'>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={person.email}
                                                onChange={(e) => handleContactPersonChange(index, 'email', e.target.value)}

                                                className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.contact_persons?.[index]?.email &&
                                                    formik.errors.contact_persons?.[index]?.toString
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                                    }`}
                                                placeholder="email@example.com"
                                            />
                                            {formik.touched.contact_persons?.[index]?.email &&
                                                formik.errors.contact_persons?.[index]?.toString() && (
                                                    <div className="mt-1 text-sm text-red-600">
                                                        {formik.errors.contact_persons[index].toString()}
                                                    </div>
                                                )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={person.phone}
                                                onChange={(e) => handleContactPersonChange(index, 'phone', e.target.value)}

                                                className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${formik.touched.contact_persons?.[index]?.phone &&
                                                    formik.errors.contact_persons?.[index]?.toString()
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                                    }`}
                                                placeholder="+2348201234567"
                                            />
                                            {formik.touched.contact_persons?.[index]?.phone &&
                                                formik.errors.contact_persons?.[index]?.toString() && (
                                                    <div className="mt-1 text-sm text-red-600">
                                                        {formik.errors.contact_persons[index].toString()}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formik.touched.contact_persons && typeof formik.errors.contact_persons === 'string' && (
                                <div className="mt-1 text-sm text-red-600">{formik.errors.contact_persons}</div>
                            )}
                        </div>

                        <div className="col-span-full flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => formik.resetForm()}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-2"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="px-5 py-2.5 bg-teal-600 border border-transparent rounded-lg text-white font-medium hover:bg-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
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
                                    'Create Customer'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerForm;