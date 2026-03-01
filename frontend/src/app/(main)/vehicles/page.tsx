"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    CarFront,
    ChevronRight,
    MoreVertical,
    Calendar,
    Phone
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Vehicle {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    year: number;
    kilometer: number;
    customerPhone: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Performans: Sadece debounce edilmeden ilk ve normal get yapıyoruz,
    // gerçekte useEffect ile debounce edilebilir bu kısım MVP için tetiğe bağlı.
    async function fetchVehicles(query: string = "") {
        setIsLoading(true);
        try {
            const url = query ? `/Vehicles/search?query=${encodeURIComponent(query)}` : `/Vehicles`;
            const response = await apiClient.get(url);
            if (response.data.success) {
                setVehicles(response.data.data || []);
            }
        } catch (error) {
            console.error("Araçlar yüklenemedi", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVehicles(searchTerm);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Banner & Search */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 md:p-6 pb-6 md:pb-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                    <CarFront size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Araç Kayıtları</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-6 max-w-md text-sm md:text-base">
                    Atölyenize gelen araçları plakadan sorgulayabilir veya yeni araç ekleyebilirsiniz.
                </p>

                <div className="w-full max-w-xl flex gap-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="34 ABC 123 plaka veya müşteri arayın..."
                            className="pl-10 h-12 rounded-xl text-base bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500"
                        />
                    </form>
                    {/* Gelecekte eklenecek Yeni Araç Modal'i için buton */}
                    <Button className="h-12 w-12 md:w-auto md:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 md:gap-2 shrink-0">
                        <Plus size={20} />
                        <span className="hidden md:inline">Yeni Araç</span>
                    </Button>
                </div>
            </div>

            {/* Modern List */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Kayıtlı Araçlar</h2>
                    <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
                        {isLoading ? "..." : vehicles.length} Araç
                    </span>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        // Skeleton 
                        [1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 p-4 rounded-xl flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))
                    ) : vehicles.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center">
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 p-4 rounded-full inline-block mb-4">
                                <Search size={32} />
                            </span>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Sonuç Bulunamadı</h3>
                            <p className="text-zinc-500 max-w-sm mt-1 text-sm">Aradığınız kriterlere uygun kayıtlı araç görünmüyor veya sistemde hiç araç yok.</p>
                        </div>
                    ) : (
                        vehicles.map((vh) => (
                            <Link href={`/vehicles/${vh.id}`} key={vh.id}>
                                <div className="group bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 p-4 rounded-xl flex items-center gap-4 hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer shadow-sm hover:shadow-md">

                                    {/* Avatar / Plaka Baş harfi tarzı */}
                                    <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl flex items-center justify-center font-bold text-lg text-zinc-700 dark:text-zinc-200 uppercase shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400 transition-colors">
                                        {vh.plateNumber.substring(0, 2)}
                                    </div>

                                    {/* Detaylar */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-50 truncate tracking-tight">
                                            {vh.plateNumber}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 font-medium text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
                                            <span className="flex items-center gap-1"><CarFront size={14} /> {vh.brand} {vh.model}</span>
                                            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {vh.year}</span>
                                            {vh.customerPhone && (
                                                <>
                                                    <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                                                    <span className="flex items-center gap-1 text-blue-600/80 dark:text-blue-400/80"><Phone size={14} /> {vh.customerPhone}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sağ Menü - Butonlar */}
                                    <div className="flex items-center gap-1 md:gap-3">
                                        <div className="hidden md:flex flex-col text-right mr-2">
                                            <span className="text-xs text-zinc-400 uppercase font-semibold">Km</span>
                                            <span className="font-medium text-sm">{vh.kilometer.toLocaleString()}</span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.preventDefault(); /* Düzenle açtırılacak */ }}>Düzenle</DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-blue-600" onClick={(e) => { e.preventDefault(); /* Hızlı İş Aç */ }}>Hızlı İş Fişi Aç</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <ChevronRight size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
