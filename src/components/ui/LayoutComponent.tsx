"use client";

import { useEffect, useMemo, useState } from "react";
import SideNav from "./SideNav";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import UserMenu from "./UserMenu";
import { UserRole } from "@/types/user.type";

export const menuItems = [
    {
        id: "customer",
        title: "Create Customer",
        description: "Add new customers",
        path: "/form/customer",
        icon: "fi fi-rr-users" // Users icon for customers
    },
    {
        id: "product",
        title: "Create Product",
        description: "Add new products to inventory",
        path: "/form/product",
        icon: "fi fi-rr-box" // Box icon for products
    },
    {
        id: "pricelist",
        title: "Create Price List",
        description: "Add price list",
        path: "/form/pricelist",
        icon: "fi fi-rr-money-bill-wave" // Money bill icon for price lists
    },
    {
        id: "customerReport",
        title: "Approve Customers",
        description: "Manage customers created by staff",
        path: "/approvals/customer",
        isAdminRoute: true,
        icon: "fi fi-rr-user-check" // User with check mark for customer approvals
    },
    {
        id: "priceApproval",
        title: "Approve Price List",
        description: "Manage price approval created by staff",
        path: "/approvals/pricelist",
        isAdminRoute: true,
        icon: "fi fi-rr-clipboard-list-check" // Clipboard with check for price list approvals
    },
    {
        id: "productApproval",
        title: "Approve Product",
        description: "Review and approve product submissions",
        path: "/approvals/product",
        isAdminRoute: true,
        icon: "fi fi-rr-search-dollar"
    }
];

const routesWithoutLayout = [
    { name: "auth", path: "/" },
    { name: "dashboard", path: "/dashboard" },
];

const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);

    const pathname = usePathname();

    // Close drawer on route change
    useEffect(() => setIsOpen(false), [pathname]);

    // Safe client-only side effects
    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem("role");
            // adjust if your enum uses different casing/values
            setRole((stored as UserRole) ?? null);
        } catch {
            setRole(null);
        }
    }, []);

    const isPathWithLayout = useMemo(
        () => !routesWithoutLayout.map((r) => r.path).includes(pathname),
        [pathname]
    );




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

    if (!mounted) {
        return (
            <div className="min-h-screen">
                <UserMenu />
                {isPathWithLayout && TopBar}
                <div className="grid grid-cols-12 gap-x-2">
                    <main className="col-span-full ml-2 mr-4">{children}</main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <UserMenu />

            {isPathWithLayout && TopBar}

            <div className="grid grid-cols-12 gap-x-2">
                <div className={classNames("md:col-span-2", { hidden: !isPathWithLayout, block: isPathWithLayout })}>
                    <SideNav items={menuItems} isOpen={isOpen} onClose={() => setIsOpen(false)} />
                </div>

                <main className={classNames("col-span-full ml-2 mr-4", { "md:col-span-10": isPathWithLayout })}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutComponent;
