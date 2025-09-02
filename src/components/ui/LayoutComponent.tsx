"use client"
import { useEffect, useState } from 'react';
import SideNav from '../approvals/SideNav'
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserMenu from './UserMenu';

const menuItems = [
    {
        id: 'ledger',
        title: 'Create Account',
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
        title: "Customers Approval",
        description: "Manage customers created by staff",
        path: "/approvals/customer",
        isAdminRoute: true
    }, {
        id: "accountApproval",
        title: "Accounts Approval",
        description: "Manage accounts created by staff",
        path: "/approvals/account",
        isAdminRoute: true
    }, {
        id: "priceApproval",
        title: "Price List Approval",
        description: "Manage price approval created by staff",
        path: "/approvals/pricelist",
        isAdminRoute: true
    }
];
const routesWithoutLayout = [{ name: "auth", path: "/" }, { name: "dashboard", path: "/dashboard" }]

const LayoutComponent = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter()
    const isPathWithLayout = !routesWithoutLayout.map(item => item.path).includes(pathname)


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

        <div className="min-h-screen">
            <UserMenu />

            {isPathWithLayout && TopBar}

            <div className="grid grid-cols-12 gap-x-2">

                <div className={`md:col-span-2 ${isPathWithLayout ? "block" : "hidden"} `}> <SideNav items={menuItems} isOpen={isOpen} onClose={() => setIsOpen(false)} /></div>

                <main className={classNames("col-span-full ml-2 mr-4", { "md:col-span-10": isPathWithLayout })}>
                    {children}
                </main>
            </div>
        </div>

    )
}

export default LayoutComponent