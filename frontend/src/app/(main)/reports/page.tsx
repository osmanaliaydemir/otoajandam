"use client";

import { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import {
    BarChart2, TrendingUp, TrendingDown, Users, Wrench,
    Calendar, ChevronLeft, ChevronRight, Wallet, Car
} from "lucide-react";
import apiClient from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardData {
    thisMonthTotalServices: number;
    thisMonthTotalRevenue: number;
    openJobsCount: number;
    topStaff: {
        userId: string;
        fullName: string;
        operationCount: number;
    } | null;
}

// Basit bar chart bileşeni (harici kütüphane kullanmıyoruz)
function MiniBarChart({ data }: { data: { label: string; value: number; }[] }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-2 h-32 pt-4">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md transition-all duration-500 hover:bg-blue-600 dark:hover:bg-blue-500"
                        style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
                        title={`₺${d.value.toLocaleString('tr-TR')}`}
                    />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function ReportsPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get("/Dashboard/metrics");
            if (response.data.success) setData(response.data.data);
        } catch {
            toast.error("Raporlar yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    // Son 6 ayın etiketleri (mock trend gösterimi)  
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return { label: format(d, "MMM", { locale: tr }), value: 0 };
    });
    // Bu ayın gerçek verisini son indexe yaz
    if (data && monthLabels.length > 0) {
        monthLabels[monthLabels.length - 1].value = data.thisMonthTotalRevenue;
    }

    const prevMonth = () => setCurrentDate(d => subMonths(d, 1));
    const nextMonth = () => {
        const next = subMonths(new Date(), -1);
        if (currentDate < next) setCurrentDate(d => subMonths(d, -1));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                    <BarChart2 className="text-blue-600" />
                    Raporlar
                </h1>
                <p className="text-zinc-500 mt-1">Gelir, araç ve personel bazlı iş analizi</p>
            </div>

            {/* Ay Seçici */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
                <button onClick={prevMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <span className="font-bold text-sm min-w-28 text-center">
                    {format(currentDate, "MMMM yyyy", { locale: tr })}
                </span>
                <button onClick={nextMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* KPI Kartları */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-semibold text-zinc-500">Aylık Ciro</p>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <Wallet className="text-emerald-600" size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                            ₺{(data?.thisMonthTotalRevenue || 0).toLocaleString('tr-TR')}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                            <TrendingUp size={14} /> Sadece işçilik
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-semibold text-zinc-500">Giren Araç</p>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <Car className="text-amber-600" size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                            {data?.thisMonthTotalServices || 0}
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">Bu ayki toplam kayıt</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-semibold text-zinc-500">Servis Fişleri</p>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Wrench className="text-blue-600" size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                            {data?.openJobsCount || 0}
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">Teslim bekleyen</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-semibold text-zinc-500">Ayın Ustası</p>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <Users className="text-purple-600" size={20} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                            {data?.topStaff?.fullName || "—"}
                        </p>
                        <p className="text-xs text-purple-600 mt-2 font-bold">
                            {data?.topStaff ? `${data.topStaff.operationCount} işlem` : "Henüz veri yok"}
                        </p>
                    </div>
                </div>
            )}

            {/* Gelir Trendi Grafiği */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Son 6 Ay Gelir Trendi</h3>
                    <p className="text-xs text-zinc-400 mb-6">İşçilik bazlı tahmini aylık ciro</p>
                    {isLoading ? (
                        <Skeleton className="h-32 rounded-xl" />
                    ) : (
                        <MiniBarChart data={monthLabels} />
                    )}
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">Ortalama Fiş Değeri</h3>
                    <p className="text-xs text-zinc-400 mb-6">Bu ayki verilere göre</p>
                    {isLoading ? (
                        <Skeleton className="h-32 rounded-xl" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 gap-2">
                            <p className="text-5xl font-black text-zinc-900 dark:text-zinc-50">
                                ₺{data && data.thisMonthTotalServices > 0
                                    ? Math.round(data.thisMonthTotalRevenue / data.thisMonthTotalServices).toLocaleString('tr-TR')
                                    : "—"}
                            </p>
                            <p className="text-sm text-zinc-400 font-medium">Araç başına ortalama</p>
                            <div className={`flex items-center gap-1 text-xs font-bold ${(data?.thisMonthTotalRevenue || 0) > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {(data?.thisMonthTotalRevenue || 0) > 0
                                    ? <><TrendingUp size={14} /> Aktif ay</>
                                    : <><TrendingDown size={14} /> Veri bekleniyor</>
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bilgi Notu */}
            <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    📊 <strong>Detaylı Raporlama:</strong> Aylık bazda filtreleme seçeneği, bu aşamada dashboard metrikleri üzerinden çalışmaktadır. Gelecek güncellemede tarih aralığı seçicili ve dışa aktarılabilir (Excel/PDF) raporlar eklenecektir.
                </p>
            </div>
        </div>
    );
}
