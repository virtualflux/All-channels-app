"use client"
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react';
import { menuItems } from '../ui/LayoutComponent';

const Dashboard = () => {
    const [activeMenu, setActiveMenu] = useState<null | string>(null);
    const router = useRouter()


    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const filteredItems = useMemo(() => {
        const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
        if (role == null) return menuItems
        if (role === "admin") return menuItems;
        return menuItems.filter((item) => !item.isAdminRoute);

    }, [menuItems]);

    return (
        <div className="min-h-screen" >
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Form Options</h1>
                    <p className="text-gray-600">Select an option to manage your business data</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-100 place-items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                        <p className="text-gray-600 text-sm">Choose what you'd like to do</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`border rounded-lg p-5 transition-all duration-200 cursor-pointer hover:shadow-md ${activeMenu === item.id
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-teal-300'
                                        }`}
                                    onClick={() => handleNavigation(item.path)}
                                    onMouseEnter={() => setActiveMenu(item.id)}
                                    onMouseLeave={() => setActiveMenu(null)}
                                >
                                    <div className="flex flex-col items-center text-center h-full">
                                        <div className={`p-3 rounded-full mb-4 ${activeMenu === item.id ? 'bg-teal-100' : 'bg-gray-100'
                                            }`}>
                                            {item.id === 'ledger' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V6h14v14zM8 10h8v2H8v-2zm0 4h8v2H8v-2z" />
                                                </svg>
                                            )}
                                            {item.id === 'customer' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            )}
                                            {item.id === 'prices' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                                </svg>
                                            )}{item.id === 'customerReport' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                                                </svg>
                                            )}
                                            {/* Accounts Report Icon */}
                                            {item.id === 'accountReport' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" />
                                                </svg>
                                            )}
                                            {/* Price List Report Icon */}
                                            {item.id === 'priceReport' && (
                                                <svg className={`h-8 w-8 ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-600'
                                                    }`} viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className={`font-semibold mb-2 ${activeMenu === item.id ? 'text-teal-700' : 'text-gray-800'
                                            }`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 flex-grow">
                                            {item.description}
                                        </p>
                                        {/* <div className={`flex items-center text-sm font-medium ${activeMenu === item.id ? 'text-teal-600' : 'text-gray-500'
                                            }`}>
                                            <span>Get started</span>
                                            <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                            </svg>
                                        </div> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Dashboard;