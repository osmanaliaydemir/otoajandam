"use client";

import { useEffect, useState, use } from "react";
import {
    CarFront,
    Calendar,
    Phone,
    ArrowLeft,
    Plus,
    History,
    Wrench,
    Clock,
    CheckCircle2,
    Info,
    ChevronRight,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import apiClient from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Vehicle {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    year: number;
    kilometer: number;
    customerPhone: string;
}

interface ServiceRecord {
    id: string;
    arrivalDate: string;
    status: string;
    notes: string;
    operations: any[];
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: vehicleId } = use(params);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [records, setRecords] = useState<ServiceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // Paralel veri çekme
                const [vResponse, rResponse] = await Promise.all([
                    apiClient.get(`/Vehicles/${vehicleId}`),
                    apiClient.get(`/ServiceRecords/vehicle/${vehicleId}`)
                ]);

                if (vResponse.data.success) {
                    setVehicle(vResponse.data.data);
                }
                if (rResponse.data.success) {
                    setRecords(rResponse.data.data || []);
                }
            } catch (error) {
                console.error("Araç detayları yüklenemedi", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [vehicleId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Bekliyor":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
            case "İşlemde":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
            case "Tamamlandı":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
            default:
                return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/10 border-zinc-200";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-32" />
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-2xl" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-xl font-bold">Araç Bulunamadı</h2>
                <Button variant="link" asChild className="mt-4">
                    <Link href="/vehicles">Araç listesine dön</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Navigasyon */}
            <Button variant="ghost" size="sm" asChild className="hover:bg-zinc-100 dark:hover:bg-zinc-800 -ml-2 text-zinc-500">
                <Link href="/vehicles" className="flex items-center gap-2">
                    <ArrowLeft size={16} />
                    Araç Listesine Dön
                </Link>
            </Button>

            {/* Araç Bilgi Kartı */}
            <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 relative">
                    {/* Plaka Avatar */}
                    <div className="h-24 w-24 bg-zinc-900 text-white rounded-2xl flex flex-col items-center justify-center border-4 border-zinc-100 dark:border-zinc-800 shadow-xl shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 z-0 h-full w-full bg-size-[16px_16px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"></div>
                        <span className="text-xs font-bold opacity-60 uppercase mb-0.5">TR</span>
                        <span className="text-2xl font-black tracking-tighter uppercase">{vehicle.plateNumber}</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {vehicle.brand} {vehicle.model}
                            </h1>
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 font-bold">
                                {vehicle.year}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-zinc-500 dark:text-zinc-400 font-medium">
                            <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <MapPin size={16} className="text-blue-500" />
                                {vehicle.kilometer.toLocaleString()} KM
                            </span>
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                <Phone size={16} />
                                {vehicle.customerPhone}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 md:w-48">
                        <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-600/20">
                            <Plus size={18} />
                            Hizmet Kaydı Aç
                        </Button>
                        <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                            Bilgileri Düzenle
                        </Button>
                    </div>
                </div>
            </div>

            {/* Servis Geçmişi */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <History size={20} className="text-blue-600" />
                            Servis Geçmişi
                        </h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                            Toplam {records.length} Kayıt
                        </span>
                    </div>

                    <div className="space-y-4">
                        {records.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-12 text-center">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info size={32} className="text-zinc-400" />
                                </div>
                                <h3 className="font-bold text-lg">Geçmiş Kayıt Yok</h3>
                                <p className="text-zinc-500 text-sm mt-1">Bu araç için henüz bir servis fişi oluşturulmamış.</p>
                            </div>
                        ) : (
                            records.map((rec) => (
                                <div key={rec.id} className="group bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-800 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-zinc-400" />
                                                <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100 lowercase">
                                                    {format(new Date(rec.arrivalDate), "dd MMMM yyyy", { locale: tr })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-500">
                                                Saat: {format(new Date(rec.arrivalDate), "HH:mm")}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={`rounded-xl border font-bold ${getStatusColor(rec.status)}`}>
                                            {rec.status}
                                        </Badge>
                                    </div>

                                    {rec.notes && (
                                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm italic text-zinc-600 dark:text-zinc-400 mb-4">
                                            "{rec.notes}"
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase">
                                                <Wrench size={14} />
                                                {rec.operations?.length || 0} İşlem
                                            </div>
                                            <Separator orientation="vertical" className="h-4 bg-zinc-200 dark:bg-zinc-800" />
                                            {/* Toplam tutar frontendde hesaplanabilir veya backendden gelebilir, şimdilik statik detay linki */}
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                                Detayları Gör
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
