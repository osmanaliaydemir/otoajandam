"use client";

import { useEffect, useState } from "react";
import {
    CarFront, Calendar, MoreVertical, Wrench,
    Clock, CheckCircle2, Plus, Search, Filter,
    ArrowRight, Zap, AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ServiceRecord {
    id: string;
    vehicleId: string;
    vehicle?: { plateNumber: string; brand: string; model: string; customer?: { fullName: string } };
    arrivalDate: string;
    status: string;
    notes: string;
    operations: any[];
}

const STATUS = {
    "Bekliyor": {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        bar: "bg-amber-400",
        icon: <Clock size={12} />,
        dot: "bg-amber-400",
    },
    "İşlemde": {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        bar: "bg-blue-500",
        icon: <Wrench size={12} />,
        dot: "bg-blue-500",
    },
};

export default function RecordsPage() {
    const [records, setRecords] = useState<ServiceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"Hepsi" | "Bekliyor" | "İşlemde">("Hepsi");

    async function fetchActiveRecords() {
        setIsLoading(true);
        try {
            const response = await apiClient.get("/ServiceRecords/active");
            if (response.data.success) setRecords(response.data.data || []);
        } catch {
            toast.error("Servis kayıtları yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { fetchActiveRecords(); }, []);

    const handleCloseJob = async (id: string) => {
        try {
            const response = await apiClient.patch("/ServiceRecords/status", { id, status: "Tamamlandı" });
            if (response.data.success) {
                toast.success("Fiş tamamlandı olarak kapatıldı ✅");
                setRecords(prev => prev.filter(r => r.id !== id));
            }
        } catch (e: any) {
            toast.error(e.message || "Fiş kapatılırken hata oluştu.");
        }
    };

    const filtered = records.filter(r => {
        const matchSearch = search === "" ||
            r.vehicle?.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
            r.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
            r.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
            r.vehicle?.customer?.fullName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "Hepsi" || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const countBekliyor = records.filter(r => r.status === "Bekliyor").length;
    const countIslemde = records.filter(r => r.status === "İşlemde").length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Atölyedeki İşler
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Aktif servis fişleri ve iş durumları</p>
                </div>
                <Link href="/records/new">
                    <Button className="group bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 py-5 gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Yeni Fiş Aç
                    </Button>
                </Link>
            </div>

            {/* ── İstatistik Çipleri ──────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Toplam Açık", val: records.length, color: "text-zinc-900 dark:text-zinc-100", bg: "bg-white dark:bg-zinc-900", border: "border-zinc-200 dark:border-zinc-800" },
                    { label: "Bekliyor", val: countBekliyor, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-900/30" },
                    { label: "İşlemde", val: countIslemde, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4 text-center`}>
                        <p className={`text-3xl font-black ${s.color}`}>{isLoading ? "—" : s.val}</p>
                        <p className="text-xs font-semibold text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Arama + Filtre ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-zinc-400"
                        placeholder="Plaka, marka, model veya müşteri ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(["Hepsi", "Bekliyor", "İşlemde"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${filterStatus === f
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-sm"
                                : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Liste ───────────────────────────────────────────────────── */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-7 w-20 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        {search || filterStatus !== "Hepsi" ? (
                            <>
                                <AlertCircle className="text-zinc-300 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Sonuç bulunamadı</h3>
                                <p className="text-zinc-400 text-sm mt-1">Farklı bir arama terimi veya filtre deneyin.</p>
                            </>
                        ) : (
                            <>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 p-5 rounded-full mb-4">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Tüm işler bitti!</h3>
                                <p className="text-zinc-400 text-sm mt-2 max-w-xs">Atölyede açık bir iş fişi yok. Yeni bir fiş açmak ister misiniz?</p>
                                <Link href="/records/new" className="mt-6">
                                    <Button className="bg-blue-600 text-white rounded-xl gap-2">
                                        <Plus size={16} /> Yeni Fiş Aç
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    filtered.map((record) => {
                        const st = STATUS[record.status as keyof typeof STATUS] || STATUS["Bekliyor"];
                        const beklemeMs = Date.now() - new Date(record.arrivalDate).getTime();
                        const beklemeGun = Math.floor(beklemeMs / 86400000);
                        const urgent = beklemeGun >= 3;

                        return (
                            <div
                                key={record.id}
                                onClick={() => window.location.href = `/records/${record.id}`}
                                className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-100/40 dark:hover:shadow-blue-900/20 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {/* Sol durum barı */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${st.bar} rounded-l-3xl`} />

                                <div className="p-5 pl-6">
                                    <div className="flex items-start gap-4">
                                        {/* Araç İkonu */}
                                        <div className={`h-14 w-14 ${st.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                            <CarFront size={26} className={record.status === "İşlemde" ? "text-blue-600" : "text-amber-600"} />
                                        </div>

                                        {/* İçerik */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    {/* Plaka */}
                                                    <div className="flex items-center gap-2.5 mb-0.5">
                                                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-wide font-mono">
                                                            {record.vehicle?.plateNumber || "—"}
                                                        </span>
                                                        {urgent && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                                                <Zap size={10} /> {beklemeGun}g bekliyor
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Marka Model */}
                                                    <p className="text-sm text-zinc-500 font-medium truncate">
                                                        {record.vehicle?.brand} {record.vehicle?.model}
                                                        {record.vehicle?.customer?.fullName && (
                                                            <span className="text-zinc-400"> • {record.vehicle.customer.fullName}</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Sağ: badge + menu */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${st.badge}`}>
                                                        {st.icon} {record.status}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <MoreVertical size={15} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                                                            <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={e => { e.stopPropagation(); window.location.href = `/records/${record.id}`; }}>
                                                                Fişi Görüntüle
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={e => { e.stopPropagation(); window.location.href = `/records/${record.id}#print`; }}>
                                                                Fişi Yazdır
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="cursor-pointer rounded-xl text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                                                onClick={e => { e.stopPropagation(); handleCloseJob(record.id); }}
                                                            >
                                                                ✓ İşi Tamamla / Kapat
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Alt bilgi satırı */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                                                <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                                    <Calendar size={13} />
                                                    {format(new Date(record.arrivalDate), "d MMM yyyy, HH:mm", { locale: tr })}
                                                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                                                    <span className="text-zinc-400">{formatDistanceToNow(new Date(record.arrivalDate), { locale: tr, addSuffix: true })}</span>
                                                </span>

                                                {record.operations?.length > 0 && (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        <Wrench size={12} />
                                                        {record.operations.length} işlem kalemi
                                                    </span>
                                                )}

                                                {record.notes && (
                                                    <span className="text-xs text-zinc-400 italic truncate max-w-xs">
                                                        "{record.notes.slice(0, 60)}{record.notes.length > 60 ? "…" : ""}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover ok göstergesi */}
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                                    <ArrowRight size={18} className="text-blue-400" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!isLoading && filtered.length > 0 && (
                <p className="text-center text-xs text-zinc-400 pt-2">
                    {filtered.length} kayıt gösteriliyor
                    {filterStatus !== "Hepsi" || search ? ` (toplam ${records.length}'dan filtrelendi)` : ""}
                </p>
            )}
        </div>
    );
}
