export default function ApprovalsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className=" grid grid-cols-12 space-x-2"
        >
            <div className=" z-20 md:z-0 md:static transition-all ml-2 rounded-r-md bg-white px-2 md:min-h-[75vh] -translate-x-full md:translate-x-0 col-span-8 md:col-span-2">
                navigation
            </div>
            <div className="col-span-full md:col-span-10 ml-2 mr-4">
                {children}</div>

        </div>
    );
}