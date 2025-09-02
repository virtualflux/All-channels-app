import React, { useEffect, useState } from 'react'
import SideNav from './SideNav';
import { usePathname } from "next/navigation";

const menuItems = [
    {
        id: 'ledger',
        title: 'Create Ledger',
        description: 'Create an account',
        path: '/form/ledger'
    },
    {
        id: 'customer',
        title: 'Create Customer',
        description: 'Add new customers',
        path: '/form/customer'
    },
    {
        id: 'prices',
        title: 'Upload Price List',
        description: 'Import and update product pricing',
        path: '/form/prices'
    }, {
        id: "customerReport",
        title: "Customers Report",
        description: "Manage customers created by staff",
        path: "/approvals/customer",
        isAdminRoute: true
    }, {
        id: "accountReport",
        title: "Accounts Report",
        description: "Manage accounts created by staff",
        path: "/approvals/account",
        isAdminRoute: true
    }, {
        id: "priceReport",
        title: "Price List Report",
        description: "Manage price list created by staff",
        path: "/approvals/pricelist",
        isAdminRoute: true
    }
];


const ApprovalLayout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => setIsOpen(false), [pathname]);

    const TopBar = (
        <div className="md:hidden sticky top-0 z-50 bg-white border-b">
            <div className="flex items-center gap-3 px-4 py-3">
                <button
                    onClick={() => setIsOpen((s) => !s)}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
                <span className="font-semibold text-gray-800">Approvals</span>
            </div>
        </div>
    );
    return (

        <div className="grid grid-cols-12 gap-x-2">
            <SideNav items={menuItems} onClose={() => setIsOpen(false)} isOpen={isOpen} />
            <div className="col-span-full md:col-span-10 ml-2 mr-4">{children}</div>
        </div>

    )
}

export default ApprovalLayout