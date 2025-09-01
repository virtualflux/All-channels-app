"use client"
import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { z } from 'zod';
import { IAccount } from '../../../types/account.type';
import AppTable from '../ui/AppTable';
import { useQuery } from '@tanstack/react-query';





const mockAccounts: IAccount[] = [
    {
        _id: '1',
        account_name: 'Operating Bank Account',
        account_code: '1001',
        account_type: 'bank',
        description: 'Primary business operating account',
        status: 'pending',

    },
    {
        _id: '2',
        account_name: 'Accounts Receivable',
        account_code: '1200',
        account_type: 'current_assets',
        description: 'Customer outstanding payments',
        status: 'pending',
    },
    {
        _id: '3',
        account_name: 'Office Equipment',
        account_code: '1500',
        account_type: 'fixed_assets',
        description: 'Computers, furniture, and office equipment',
        status: 'approved',
    },
];

const AccountsPage = () => {
    const [data, setData] = useState<IAccount[]>(mockAccounts);

    const { } = useQuery({ queryKey: [""] })

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
                                    onClick={() => handleApprove(account)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                // disabled={isLoading}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(account.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                // disabled={isLoading}
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
                setData(prev => prev.map(acc =>
                    acc._id === account._id ? { ...acc, status: 'approved' } : acc
                ));
                alert('Account approved and created in Zoho Books successfully!');
            } else {
                throw new Error('Failed to create account in Zoho Books');
            }
        } catch (error) {
            console.error('Error approving account:', error);
            alert('Error approving account. Please try again.');
        } finally {
        }
    };

    const handleReject = async (accountId: string) => {

        try {
            // Simulate API call to reject account
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update local state
            setData(prev => prev.map(acc =>
                acc._id === accountId ? { ...acc, status: 'rejected' } : acc
            ));

            alert('Account rejected successfully!');
        } catch (error) {
            console.error('Error rejecting account:', error);
            alert('Error rejecting account. Please try again.');
        } finally {

        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Accounts</h1>
                    <p className="text-gray-600">Approve or reject accounts to create them in Zoho Books</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">

                    <AppTable data={mockAccounts} columns={columns} />

                </div>
            </div>
        </div>
    );
};

export default AccountsPage;