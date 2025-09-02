"use client"
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { ICustomer } from '../../types/customer.type';
import AppTable from '../ui/AppTable';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LocalStorageHelper } from '@/lib/LocalStorageHelper';

import { mockCustomers } from "@/lib/data/customer"

const CustomersPage = () => {
    const fetchCustomers = async () => {
        try {
            const accessToken = LocalStorageHelper.getItem("accessToken")
            const res = await axios.get<{ message: string; data: ICustomer[] }>("/api/db/customers", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            return res.data.data
        } catch (error) {
            toast.error("Error fetching customers. Please refresh the browser.")
            return []
        }
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["customers"],
        queryFn: fetchCustomers
    })

    const columns = [
        {
            accessorKey: 'contact_name',
            header: 'Contact Name',
            cell: (info: any) => info.getValue(),
        },
        {
            accessorKey: 'company_name',
            header: 'Company Name',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            accessorKey: 'customer_sub_type',
            header: 'Customer Type',
            cell: (info: any) => {
                const value = info.getValue();
                return value.charAt(0).toUpperCase() + value.slice(1);
            },
        },
        {
            accessorKey: 'contact_persons',
            header: 'Contact Persons',
            cell: (info: any) => {
                const contactPersons = info.getValue();
                return (
                    <div className="max-w-xs">
                        <details className="dropdown">
                            <summary className="btn btn-sm btn-ghost">
                                {contactPersons.length} contact(s)
                            </summary>
                            <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-64">
                                {contactPersons.map((person: any, index: number) => (
                                    <li key={index} className="mb-2 last:mb-0">
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                {person.first_name} {person.last_name}
                                            </div>
                                            <div className="text-gray-500">{person.email}</div>
                                            <div className="text-gray-500">{person.phone}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                );
            },
        },
        {
            accessorKey: 'account_id',
            header: 'Account ID',
            cell: (info: any) => info.getValue(),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => {
                const status = info.getValue();
                const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    approved: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                };
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info: any) => {
                const customer = info.row.original;
                return (
                    <div className="flex space-x-2">
                        {customer.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleApprove(customer)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(customer._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {customer.status !== 'pending' && (
                            <span className="text-gray-500 text-center text-sm">No actions</span>
                        )}
                    </div>
                );
            },
        },
    ]

    const handleApprove = async (customer: ICustomer) => {
        try {
            const accessToken = LocalStorageHelper.getItem("accessToken");
            const response = await fetch('/api/zoho/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(customer),
            });

            if (response.ok) {
                toast.success('Customer approved and created in Zoho Books successfully!');
                // You might want to refetch the data here to update the status
            } else {
                throw new Error('Failed to create customer in Zoho Books');
            }
        } catch (error) {
            console.error('Error approving customer:', error);
            toast.error('Error approving customer. Please try again.');
        }
    };

    const handleReject = async (customerId: string) => {
        try {
            const accessToken = LocalStorageHelper.getItem("accessToken");
            const response = await fetch(`/api/db/customers/${customerId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                toast.success('Customer rejected successfully!');
                // Refetch data to update the status
            } else {
                throw new Error('Failed to reject customer');
            }
        } catch (error) {
            console.error('Error rejecting customer:', error);
            toast.error('Error rejecting customer. Please try again.');
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Customers</h1>
                    <p className="text-gray-600">Approve or reject customers to create them in Zoho Books</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {isLoading ? (
                        <div className='flex flex-col gap-2'>
                            <div className='w-full my-2 h-8 p-2 bg-gray-300 animate-pulse'></div>
                            <div className='grid grid-cols-3 gap-2'>
                                <div className='w-full h-12 p-4 bg-gray-300 animate-pulse'></div>
                                <div className='w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                                <div className='w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                                <div className='w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                                <div className='w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                                <div className='w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                            </div>
                        </div>
                    ) : (
                        <AppTable data={mockCustomers as ICustomer[] ?? []} columns={columns} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomersPage;