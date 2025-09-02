"use client";

import { useEffect, useMemo, useState } from "react";
import SideNav from "./SideNav";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import UserMenu from "./UserMenu";
import { UserRole } from "@/types/user.type";

export const menuItems = [
    { id: "customer", title: "Create Customer", description: "Add new customers", path: "/form/customer" },
    { id: "product", title: "Create a Product", description: "", path: "/form/product" },
    { id: "pricelist", title: "Create Price List", description: "Add price list", path: "/form/pricelist" },
    { id: "customerReport", title: "Customers Approval", description: "Manage customers created by staff", path: "/approvals/customer", isAdminRoute: true },
    { id: "priceApproval", title: "Price List Approval", description: "Manage price approval created by staff", path: "/approvals/pricelist", isAdminRoute: true },
    { id: "productApproval", title: "Approve Product", description: "", path: "/approvals/product", isAdminRoute: true },
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

    const isAdmin = role === UserRole.ADMIN;
    const shouldShowNav = isPathWithLayout && isAdmin;

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

    // Optional: avoid layout shift before we know the role
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
                {/* Sidebar column only when allowed */}
                <div className={classNames("md:col-span-2", { hidden: !shouldShowNav, block: shouldShowNav })}>
                    <SideNav items={menuItems} isOpen={isOpen} onClose={() => setIsOpen(false)} />
                </div>

                <main className={classNames("col-span-full ml-2 mr-4", { "md:col-span-10": shouldShowNav })}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutComponent;
