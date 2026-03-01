"use client";

import { useEffect, useState } from "react";
import {
    Search, Plus, Users, ChevronRight, Phone,
    Mail, MapPin, CarFront, LayoutGrid, List,
    ArrowUpRight, UserCheck, TrendingUp
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

interface Customer {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    vehicleCount: number;
    createdAt: string;
}

type ViewMode = "grid" | "list";

function getInitials(name: string) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// Renk paleti — ismin ilk harfine göre sabit renk
const COLOR_PALETTE = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];
function avatarColor(name: string) {
    const code = name.charCodeAt(0) || 0;
    return COLOR_PALETTE[code % COLOR_PALETTE.length];
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.get("/Customers");
                if (res.data.success) setCustomers(res.data.data || []);
            } catch { }
            finally { setIsLoading(false); }
        })();
    }, []);

    const filtered = customers.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email?.toLowerCase().includes(search.toLowerCase()))
    );

    const totalVehicles = customers.reduce((s, c) => s + (c.vehicleCount || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Müşteriler</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Cari kart yönetimi, araç ve servis geçmişi</p>
                </div>
                <Link href="/customers/new">
                    <button className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all duration-200">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Yeni Müşteri
                    </button>
                </Link>
            </div>

            {/* ── İstatistikler ───────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Toplam Müşteri", val: customers.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30" },
                    { label: "Kayıtlı Araç", val: totalVehicles, icon: CarFront, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30" },
                    {
                        label: "Bu Ay", val: customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 3600 * 1000)).length,
                        icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-100 dark:border-violet-900/30"
                    },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4 text-center`}>
                        <p className={`text-3xl font-black ${s.color}`}>{isLoading ? "—" : s.val}</p>
                        <p className="text-xs font-semibold text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Arama + Görünüm ─────────────────────────────────────────── */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none placeholder:text-zinc-400"
                        placeholder="İsim, telefon veya e-posta ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Görünüm seçici */}
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <button onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
                        <LayoutGrid size={17} />
                    </button>
                    <button onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
                        <List size={17} />
                    </button>
                </div>
            </div>

            {/* ── Sonuç sayacı ────────────────────────────────────────────── */}
            {!isLoading && (
                <p className="text-xs text-zinc-400 -mt-2">
                    {filtered.length} müşteri{search ? ` "${search}" için` : ""}
                </p>
            )}

            {/* ── Liste / Grid ────────────────────────────────────────────── */}
            {isLoading ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="bg-zinc-50 dark:bg-zinc-800 text-zinc-300 p-5 rounded-full mb-4">
                        <UserCheck size={40} />
                    </div>
                    <h3 className="text-lg font-black text-zinc-700 dark:text-zinc-300">
                        {search ? "Müşteri bulunamadı" : "Henüz müşteri yok"}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-2 max-w-xs">
                        {search ? `"${search}" ile eşleşen kayıt yok.` : "İlk müşterinizi ekleyin."}
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                /* ── Grid View ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(cust => (
                        <Link key={cust.id} href={`/customers/${cust.id}`}>
                            <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg hover:shadow-emerald-100/40 rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                                {/* Köşe glow */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-[2rem] -mr-3 -mt-3 group-hover:scale-125 transition-transform duration-300" />

                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className={`h-13 w-13 min-w-[52px] h-[52px] ${avatarColor(cust.fullName)} rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                        {getInitials(cust.fullName)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                                {cust.fullName}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded-full shrink-0">
                                                <CarFront size={11} /> {cust.vehicleCount}
                                            </span>
                                        </div>

                                        <div className="mt-2.5 space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Phone size={12} className="text-emerald-500 shrink-0" />
                                                <span className="font-medium">{cust.phone}</span>
                                            </div>
                                            {cust.email && (
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                                                    <Mail size={12} className="shrink-0" />
                                                    <span className="truncate">{cust.email}</span>
                                                </div>
                                            )}
                                            {cust.address && (
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                                                    <MapPin size={12} className="shrink-0" />
                                                    <span className="truncate">{cust.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <ArrowUpRight size={16} className="text-zinc-200 group-hover:text-emerald-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* ── List View ── */
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1.5fr_72px] px-6 py-3 border-b border-zinc-50 dark:border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <span>Müşteri</span>
                        <span>Telefon</span>
                        <span>E-posta</span>
                        <span className="text-center">Araç</span>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                        {filtered.map(cust => (
                            <Link key={cust.id} href={`/customers/${cust.id}`} className="group grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1.5fr_72px] items-center gap-2 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 ${avatarColor(cust.fullName)} rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0`}>
                                        {getInitials(cust.fullName)}
                                    </div>
                                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                                        {cust.fullName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <Phone size={13} className="text-emerald-500 shrink-0" />
                                    {cust.phone}
                                </div>
                                <div className="text-sm text-zinc-400 truncate">{cust.email || "—"}</div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                                        <CarFront size={11} /> {cust.vehicleCount}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Alt sayaç */}
            {!isLoading && filtered.length > 0 && (
                <p className="text-center text-xs text-zinc-400 pt-1">
                    {filtered.length} kayıt gösteriliyor
                </p>
            )}
        </div>
    );
}
