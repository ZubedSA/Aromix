import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <MobileHeader />
            <main className="flex-1 min-w-0 overflow-x-hidden ml-0 md:ml-64 min-h-screen transition-all pt-16 pb-24 md:pt-0 md:pb-0">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
