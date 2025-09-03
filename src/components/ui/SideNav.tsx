"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "../../types/user.type";
import classNames from "classnames";

export type MenuItem = {
    id: string;
    title: string;
    description: string;
    path: string;
    isAdminRoute?: boolean;
    icon: string;
};

type Props = {
    items: MenuItem[];
    isOpen: boolean;
    onClose: () => void;
    storageKey?: string;
};


export default function SideNav({ items, storageKey = "role", isOpen, onClose }: Props) {
    const pathname = usePathname();
    const [isAdmin, setAdmin] = useState(false);

    const checkRole = () => {
        try {
            if (typeof window === "undefined") return;
            setAdmin(localStorage.getItem(storageKey) == UserRole.ADMIN);
        } catch {
            setAdmin(false);
        }
    };

    useEffect(() => {
        checkRole();

        const handleStorage = (e: StorageEvent) => {
            if (!e.key || e.key === storageKey) checkRole();
        };
        const handleFocus = () => checkRole();
        const handleCustom = () => checkRole();

        window.addEventListener("storage", handleStorage);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("role-updated", handleCustom as EventListener);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("role-updated", handleCustom as EventListener);
        };
    }, [storageKey]);

    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);


    const mobileVisible = isAdmin && isOpen;

    // Core panel classes (mobile drawer + md sidebar)
    const panelClass = [
        // positioning
        "fixed inset-y-0 left-0 w-72 md:static md:w-auto",
        // box visuals
        "z-40 md:z-0 bg-white rounded-r-md px-2 py-3 md:min-h-[75vh] shadow md:shadow-none",
        // motion
        "transform transition-transform duration-300 ease-out",
        // show/hide rules
        mobileVisible ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
    ].join(" ");

    const activeClass = (active: boolean) =>
        [
            "block rounded-lg p-3 hover:bg-gray-100",
            active ? "bg-gray-100 ring-1 ring-gray-200" : "",
        ].join(" ");



    return (
        <>
            {mobileVisible && (
                <button
                    aria-label="Close navigation"
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={panelClass}>
                <nav className="py-1">
                    <div className="flex items-center justify-between md:hidden px-1 pb-2">
                        <span className="text-sm font-semibold text-gray-700">Navigation</span>
                        <button
                            onClick={onClose}
                            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {items.map((item) => {
                            const active = pathname.startsWith(item.path);
                            return (
                                <li className={classNames(activeClass(active), "flex items-center gap-2 ")} key={item.id}>
                                    <i className={item.icon}></i>
                                    <Link
                                        href={item.path}
                                        onClick={onClose}
                                        className=" -mt-2"
                                    >
                                        <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
}
