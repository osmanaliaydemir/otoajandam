"use client";

import { useEffect, useState } from "react";
import {
    CarFront,
    Users,
    LayoutDashboard,
    ClipboardList,
    LogOut,
    Menu,
    Package,
    BarChart2,
    Settings
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import NextLink from "next/link";

const navItems = [
    { title: "Özet", href: "/dashboard", icon: LayoutDashboard },
    { title: "Servis Fişleri", href: "/records", icon: ClipboardList },
    { title: "Araçlar", href: "/vehicles", icon: CarFront },
    { title: "Müşteriler", href: "/customers", icon: Users },
    { title: "Katalog", href: "/products", icon: Package },
    { title: "Raporlar", href: "/reports", icon: BarChart2 },
    { title: "Ayarlar", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuthStore();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    // Pencere boyutunu izleyip mobil layout'a geçip geçmediğine bakıyoruz.
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // İlk açıldığında çalıştır
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">

            {/* Desktop Sidebar (Orta ve Büyük ekranlarda) */}
            {!isMobile && (
                <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm shrink-0 relative z-20">
                    <div>
                        <div className="p-6 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 shrink-0">
                                    <CarFront size={22} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">OtoAjandam</h1>
                                </div>
                            </div>
                        </div>

                        <nav className="p-4 space-y-1">
                            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-4">Menu</p>
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <NextLink
                                        href={item.href}
                                        key={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                            }`}
                                    >
                                        <item.icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
                                        {item.title}
                                    </NextLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4">
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                    {user?.firstName?.charAt(0) || "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.roles?.[0] || 'Personel'}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                                <LogOut size={16} />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">

                {/* Mobile Top Header */}
                {isMobile && (
                    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                                <CarFront size={18} />
                            </div>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">OtoAjandam</h1>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-zinc-500 hover:text-red-600 rounded-md transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </header>
                )}

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 pb-24 md:pb-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation (Sadece küçük ekranda) */}
            {isMobile && (
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-center z-50 px-2 pb-safe">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <NextLink
                                href={item.href}
                                key={item.href}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                                    }`}
                            >
                                <div className={`p-1 rounded-full ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                    <item.icon size={22} className={isActive ? "" : "opacity-80"} />
                                </div>
                                <span className="text-[10px] font-medium">{item.title}</span>
                            </NextLink>
                        );
                    })}
                </nav>
            )}

        </div>
    );
}
