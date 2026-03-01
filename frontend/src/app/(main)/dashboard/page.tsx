"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
    CarFront, Wallet, Wrench, TrendingUp, Clock,
    ArrowRight, UserCheck, Plus, ClipboardList,
    Package, BarChart2, ChevronRight, Zap, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

interface DashboardData {
    thisMonthTotalServices: number;
    thisMonthTotalRevenue: number;
    openJobsCount: number;
    topStaff: { userId: string; fullName: string; operationCount: number } | null;
}

interface RecentRecord {
    id: string;
    status: string;
    arrivalDate: string;
    notes: string;
    vehicle?: { plateNumber: string; brand: string; model: string };
    operations: any[];
}

const STATUS_STYLE: Record<string, { badge: string; dot: string; label: string }> = {
    "Bekliyor": { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400", label: "Bekliyor" },
    "İşlemde": { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "İşlemde" },
    "Tamamlandı": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Tamamlandı" },
};


export default function DashboardPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [metricsRes, recordsRes] = await Promise.all([
                    apiClient.get("/Dashboard/metrics"),
                    apiClient.get("/ServiceRecords/active"),
                ]);
                if (metricsRes.data.success) setData(metricsRes.data.data);
                if (recordsRes.data.success) setRecentRecords((recordsRes.data.data || []).slice(0, 5));
            } catch (e) {
                console.error("Dashboard verisi çekilemedi", e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Günaydın";
        if (h < 18) return "İyi Günler";
        return "İyi Akşamlar";
    };

    const kpis = [
        {
            label: "Açık Fiş",
            value: data?.openJobsCount ?? 0,
            display: String(data?.openJobsCount ?? 0),
            icon: Wrench,
            gradient: "from-blue-500 to-blue-600",
            glow: "shadow-blue-500/25",
            bg: "bg-blue-50",
            sub: "Teslim bekleyen",
            subIcon: Clock,
            color: "text-blue-600",
            barColor: "bg-blue-400",
        },
        {
            label: "Aylık Ciro",
            value: data?.thisMonthTotalRevenue ?? 0,
            display: `₺${(data?.thisMonthTotalRevenue ?? 0).toLocaleString("tr-TR")}`,
            icon: Wallet,
            gradient: "from-emerald-500 to-teal-600",
            glow: "shadow-emerald-500/25",
            bg: "bg-emerald-50",
            sub: "Sadece işçilik",
            subIcon: TrendingUp,
            color: "text-emerald-600",
            barColor: "bg-emerald-400",
        },
        {
            label: "Giren Araç",
            value: data?.thisMonthTotalServices ?? 0,
            display: String(data?.thisMonthTotalServices ?? 0),
            icon: CarFront,
            gradient: "from-amber-500 to-orange-500",
            glow: "shadow-amber-500/25",
            bg: "bg-amber-50",
            sub: "Bu ay",
            subIcon: BarChart2,
            color: "text-amber-600",
            barColor: "bg-amber-400",
        },
        {
            label: "Ayın Ustası",
            value: 0,
            display: data?.topStaff?.fullName ?? "—",
            icon: UserCheck,
            gradient: "from-purple-500 to-violet-600",
            glow: "shadow-purple-500/25",
            bg: "bg-purple-50",
            sub: data?.topStaff ? `${data.topStaff.operationCount} işlem` : "Henüz veri yok",
            subIcon: Zap,
            color: "text-purple-600",
            barColor: "bg-purple-400",
            isText: true,
        },
    ];

    const quickActions = [
        { label: "Yeni Fiş Aç", href: "/records/new", icon: Plus, color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25" },
        { label: "Servis Fişleri", href: "/records", icon: ClipboardList, color: "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200" },
        { label: "Katalog", href: "/products", icon: Package, color: "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200" },
        { label: "Raporlar", href: "/reports", icon: BarChart2, color: "bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200" },
    ];

    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* ── Selamlama ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl px-7 py-5 shadow-sm">
                <div className="flex items-center gap-5">
                    {/* Sol accent bar */}
                    <div className="hidden sm:block w-1 h-12 bg-blue-600 rounded-full shrink-0" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center text-xs font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2.5 py-1 rounded-full">
                                📅 {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            {greeting()},{" "}
                            <span className="text-blue-600 dark:text-blue-400">
                                {user?.firstName || user?.email?.split("@")[0] || ""}
                            </span>{" "}
                            👋
                        </h1>
                        <p className="text-zinc-400 text-sm mt-0.5 font-medium">
                            Atölyenizin günlük özeti hazır. Hadi bakalım!
                        </p>
                    </div>
                </div>
                <Link href="/records/new" className="shrink-0">
                    <button className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Yeni Fiş Aç
                    </button>
                </Link>
            </div>

            {/* ── KPI Kartları ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-bl-[3rem] opacity-60 -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-300`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{kpi.label}</p>
                                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${kpi.gradient} flex items-center justify-center text-white shadow-lg ${kpi.glow}`}>
                                    <kpi.icon size={18} />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-24 mb-3" />
                            ) : (
                                <p className={`font-black tracking-tight mb-1 ${kpi.isText ? "text-2xl leading-tight" : "text-4xl"} text-zinc-900 dark:text-zinc-50`}>
                                    {kpi.display}
                                </p>
                            )}

                            <p className={`text-xs font-semibold ${kpi.color} mt-2 flex items-center gap-1`}>
                                <kpi.subIcon size={11} /> {kpi.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Alt Grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Sol: Açık Fişler ──────────────────────── */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-50 dark:border-zinc-800">
                        <div>
                            <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Açık Servis Fişleri</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Atölyedeki aktif işler</p>
                        </div>
                        <Link href="/records" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                            Tümünü gör <ChevronRight size={14} />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-5 space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}
                        </div>
                    ) : recentRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                            <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full mb-3">
                                <CheckCircle size={32} />
                            </div>
                            <p className="font-bold text-zinc-700 dark:text-zinc-300">Harika! Açık iş yok.</p>
                            <p className="text-sm text-zinc-400 mt-1">Atölye şu an boş.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {recentRecords.map(rec => {
                                const st = STATUS_STYLE[rec.status] || STATUS_STYLE["Bekliyor"];
                                return (
                                    <Link key={rec.id} href={`/records/${rec.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${rec.status === "İşlemde" ? "bg-blue-50" : "bg-amber-50"}`}>
                                            <CarFront size={20} className={rec.status === "İşlemde" ? "text-blue-500" : "text-amber-500"} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-wide">
                                                    {rec.vehicle?.plateNumber || "—"}
                                                </span>
                                                <span className="text-zinc-400 text-xs font-medium truncate hidden sm:block">
                                                    {rec.vehicle?.brand} {rec.vehicle?.model}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                {formatDistanceToNow(new Date(rec.arrivalDate), { locale: tr, addSuffix: true })}
                                                {rec.operations?.length > 0 && ` · ${rec.operations.length} işlem`}
                                            </p>
                                        </div>
                                        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${st.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                            {st.label}
                                        </span>
                                        <ArrowRight size={16} className="text-zinc-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sağ: Hızlı Aksiyonlar + Ortalama Fiş ──── */}
                <div className="space-y-5">
                    {/* Hızlı İşlemler */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm p-6">
                        <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">Hızlı İşlemler</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map(a => (
                                <Link key={a.label} href={a.href}>
                                    <button className={`w-full flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl text-xs font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${a.color}`}>
                                        <a.icon size={22} />
                                        {a.label}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Ortalama Fiş Değeri */}
                    <div className="bg-linear-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-700 rounded-3xl shadow-sm p-6 text-white">
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Ort. Fiş Değeri</p>
                        <p className="text-4xl font-black tracking-tight mt-2">
                            {isLoading ? "—" : data && data.thisMonthTotalServices > 0
                                ? `₺${Math.round(data.thisMonthTotalRevenue / data.thisMonthTotalServices).toLocaleString("tr-TR")}`
                                : "—"}
                        </p>
                        <p className="text-zinc-400 text-xs mt-2">Araç başına işçilik ortalaması</p>
                        <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                            <span className="text-xs text-zinc-400">{data?.thisMonthTotalServices ?? 0} fiş bu ay</span>
                            <Link href="/reports" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Detay <ChevronRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
