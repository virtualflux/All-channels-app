"use client"
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { IAccount } from '../../types/account.type';
import AppTable from '../ui/AppTable';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LocalStorageHelper } from '@/lib/LocalStorageHelper';




const AccountsPage = () => {
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
    const [loading, setLoading] = useState(false)



    type UpdateStatusPayload = {
        status: "pending" | "approved" | "rejected";
    };

    const approveAccount = async (accountId: string) => {
        const body: UpdateStatusPayload = { status: "approved" };
        await axios.put(`/api/db/accounts/${accountId}`, body).then((res) => { }).catch(error => { }).finally(() => {
            setLoading(false)
        });
        return
    }

    const rejectAccount = async (accountId: string) => {
        const body: UpdateStatusPayload = { status: "rejected" };
        await axios.put(`/api/db/accounts/${accountId}`, body).then((res) => { }).catch(error => { }).finally(() => {
            setLoading(false)
        });
    }

    const handleApprove = async (account: IAccount) => {

        try {
            const response = await fetch('/api/zoho/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(account),
            });

            if (response.ok) {
                // Update local state
                // setData(prev => prev.map(acc =>
                //     acc._id === account._id ? { ...acc, status: 'approved' } : acc
                // ));
                // alert('Account approved and created in Zoho Books successfully!');
            } else {
                throw new Error('Failed to create account in Zoho Books');
            }
        } catch (error) {
            console.error('Error approving account:', error);
            alert('Error approving account. Please try again.');
        } finally {
        }
    };




    const columns = [
        {
            accessorKey: 'account_name',
            header: 'Account Name',
            cell: (info: any) => info.getValue(),
        },
        {
            accessorKey: 'account_code',
            header: 'Account Code',
            cell: (info: any) => info.getValue(),
        },
        {
            accessorKey: 'account_type',
            header: 'Account Type',
            cell: (info: any) => {
                const value = info.getValue();
                return value.toUpperCase()
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: (info: any) => info.getValue() || '-',
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
                const account = info.row.original;
                return (
                    <div className="flex space-x-2">
                        {account.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => approveAccount(account._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => rejectAccount(account._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={loading}
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {account.status !== 'pending' && (
                            <span className="text-gray-500 text-center text-sm">No actions</span>
                        )}
                    </div>
                );
            },
        },
    ]

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Accounts</h1>
                    <p className="text-gray-600">Approve or reject accounts to create them in Zoho Books</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {
                        isLoading ? <div className='flex flex-col gap-2'>
                            <div className=' w-full my-2 h-8 p-2 bg-gray-300 animate-pulse'></div>
                            <div className='grid grid-cols-3 gap-2'>

                                <div className=' w-full h-12 p-4 bg-gray-300 animate-pulse'></div>
                                <div className=' w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                                <div className=' w-full h-12 p-2 bg-gray-300 animate-pulse'></div>

                                <div className=' w-full h-12 p-2 bg-gray-300 animate-pulse'></div>

                                <div className=' w-full h-12 p-2 bg-gray-300 animate-pulse'></div>

                                <div className=' w-full h-12 p-2 bg-gray-300 animate-pulse'></div>
                            </div>
                        </div> :
                            <AppTable data={data as IAccount[] ?? []} columns={columns} />
                    }

                </div>
            </div>
        </div>
    );
};

export default AccountsPage;