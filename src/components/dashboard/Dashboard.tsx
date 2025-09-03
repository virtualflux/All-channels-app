"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react';
import { menuItems } from '../ui/LayoutComponent';

const Dashboard = () => {
    const [activeMenu, setActiveMenu] = useState<null | string>(null);
    const router = useRouter()


    const [filteredItems, setFilteredItems] = useState(menuItems)
    const handleNavigation = (path: string) => {
        router.push(path);
    };

    useEffect(() => {
        try {
            const role = localStorage.getItem("role");
            const filteredItems = menuItems.filter((item) => !item.isAdminRoute);

            if (role == "staff") setFilteredItems(filteredItems)
            if (role === "admin") return

        } catch {

        }
    }, []);



    return (
        <div className="min-h-screen" >
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">App Actions</h1>
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
                                        <div className={`p-3 h-12 w-12 rounded-full mb-4 ${activeMenu === item.id ? 'bg-teal-100' : 'bg-gray-100'
                                            }`}>
                                            <i className={item.icon}></i>

                                        </div>
                                        <h3 className={`font-semibold mb-2 ${activeMenu === item.id ? 'text-teal-700' : 'text-gray-800'
                                            }`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 flex-grow">
                                            {item.description}
                                        </p>

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