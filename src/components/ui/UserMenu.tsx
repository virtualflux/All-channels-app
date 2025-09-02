"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LocalStorageHelper } from "@/lib/LocalStorageHelper";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on outside click or Escape
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const logout = async () => {
        try {
            await axios.post("/api/db/auth/logout");
            LocalStorageHelper.clearItems()
            toast.success("Logout successful");
            router.replace("/");
        } catch (err) {
            console.error(err);
            toast.error("Logout failed");
        } finally {
            setOpen(false);
        }
    };

    return (
        <div ref={ref} className="fixed top-2 right-2 z-50">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="hover:bg-slate-300 bg-white h-12 w-12 rounded-full grid place-items-center shadow"
            >
                <i className="fi fi-rr-user-logout" />
            </button>

            {/* Menu */}
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg p-1"
                >

                    <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
