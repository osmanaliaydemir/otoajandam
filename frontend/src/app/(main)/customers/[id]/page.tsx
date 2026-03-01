"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft,
    Phone,
    Mail,
    MapPin,
    CarFront,
    Calendar,
    ChevronRight,
    Search,
    User,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
}

interface CustomerDetail {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    vehicleCount: number;
    vehicles: Vehicle[];
    createdAt: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: customerId } = use(params);
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchCustomerDetail() {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/Customers/${customerId}`);
            if (response.data.success) {
                setCustomer(response.data.data);
            }
        } catch (error) {
            console.error("Müşteri detayları yüklenemedi", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomerDetail();
    }, [customerId]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-bold">Müşteri Bulunamadı</h2>
                <Button className="mt-4" onClick={() => router.back()}>Geri Dön</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="gap-2 px-0 hover:bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() => router.push("/customers")}
                >
                    <ChevronLeft size={20} />
                    Müşteri Listesine Dön
                </Button>
                <Badge variant="outline" className="text-xs font-normal text-zinc-400">
                    ID: {customer.id.substring(0, 8)}...
                </Badge>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
                    <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center font-bold text-4xl text-emerald-700 dark:text-emerald-400 border-4 border-white dark:border-zinc-800 shadow-xl shrink-0">
                        {customer.fullName.charAt(0)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {customer.fullName}
                            </h1>
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0">
                                Müşteri
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 mt-4">
                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Phone size={16} className="text-emerald-500" />
                                </div>
                                <span className="font-medium">{customer.phone}</span>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Mail size={16} />
                                </div>
                                <span className="truncate">{customer.email || "E-posta belirtilmemiş"}</span>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 md:col-span-2">
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <span>{customer.address || "Adres bilgisi girilmemiş"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicles List (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CarFront className="text-emerald-500" size={24} />
                            Araçlar
                        </h2>
                        <Button size="sm" variant="outline" className="rounded-lg gap-2 text-xs">
                            <Search size={14} /> Yeni Araç Ekle
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {customer.vehicles.length === 0 ? (
                            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 p-12 rounded-2xl text-center">
                                <CarFront size={48} className="mx-auto text-zinc-300 mb-4" />
                                <p className="text-zinc-500">Müşteriye ait kayıtlı araç bulunamadı.</p>
                            </div>
                        ) : (
                            customer.vehicles.map((vh) => (
                                <Link href={`/vehicles/${vh.id}`} key={vh.id}>
                                    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-zinc-900 text-white rounded-lg flex flex-col items-center justify-center font-bold text-xs shrink-0 relative overflow-hidden">
                                                <div className="absolute inset-0 z-0 bg-size-[8px_8px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-20"></div>
                                                <span className="relative z-10">{vh.plateNumber.substring(0, 2)}</span>
                                                <span className="relative z-10 text-[10px] opacity-60">TR</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase">
                                                    {vh.plateNumber}
                                                </h4>
                                                <p className="text-sm text-zinc-500 mt-0.5">
                                                    {vh.brand} {vh.model} ({vh.year})
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 text-zinc-300 group-hover:text-emerald-500 transition-all">
                                            <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Info / Stats Summary (1/3) */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-4 relative z-10">Müşteri Özeti</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-zinc-400 text-sm">Toplam Araç</span>
                                <span className="font-bold text-xl text-emerald-400">{customer.vehicleCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-zinc-400 text-sm">Üyelik Tarihi</span>
                                <span className="font-medium">{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-zinc-400 text-sm">Sadakat Puanı</span>
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Premium</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-zinc-400" />
                            Notlar
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed italic">
                            "Bu müşteri her bakımda orijinal yağ filtresi talep ediyor. Yedek anahtarı servise bırakmayı tercih ediyor."
                        </p>
                        <Button variant="link" className="p-0 h-auto text-xs text-blue-600 mt-3">Düzenle</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
