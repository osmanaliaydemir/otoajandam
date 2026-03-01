"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    Car,
    User,
    FileText,
    Search,
    Save,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Wrench
} from "lucide-react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Separator = ({ className = "" }: { className?: string }) => {
    return <div className={`h-px w-full bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
};

interface Vehicle {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    customerPhone: string;
}

interface StaffMember {
    id: string;
    fullName: string;
}

interface OperationRow {
    id: string;
    description: string;
    userId: string;
    price: number;
    showSuggestions?: boolean;
    suggestions?: any[];
}

export default function NewRecordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [notes, setNotes] = useState("");
    const [operations, setOperations] = useState<OperationRow[]>([
        { id: Math.random().toString(), description: "", userId: "", price: 0 }
    ]);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await apiClient.get("/ServiceRecords/staff");
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error("Personel listesi alınamadı", error);
        }
    };

    const searchVehicles = async (val: string) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setVehicles([]);
            return;
        }
        try {
            const response = await apiClient.get(`/vehicles/search?query=${val}`);
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error("Araç araması başarısız", error);
        }
    };

    const addOperation = () => {
        setOperations([...operations, { id: Math.random().toString(), description: "", userId: "", price: 0 }]);
    };

    const removeOperation = (id: string) => {
        if (operations.length === 1) return;
        setOperations(operations.filter(op => op.id !== id));
    };

    const updateOperation = (id: string, field: keyof OperationRow, value: any) => {
        setOperations(operations.map(op => op.id === id ? { ...op, [field]: value } : op));

        if (field === "description" && value.length >= 2) {
            searchProducts(id, value);
        }
    };

    const searchProducts = async (opId: string, query: string) => {
        try {
            const response = await apiClient.get(`/Products/search?query=${query}`);
            if (response.data.success) {
                setOperations(prev => prev.map(op =>
                    op.id === opId ? { ...op, suggestions: response.data.data, showSuggestions: true } : op
                ));
            }
        } catch (error) {
            console.error("Ürün araması başarısız", error);
        }
    };

    const selectProduct = (opId: string, product: any) => {
        setOperations(prev => prev.map(op =>
            op.id === opId ? {
                ...op,
                description: product.name,
                price: product.price,
                showSuggestions: false
            } : op
        ));
    };

    const totalAmount = operations.reduce((sum, op) => sum + Number(op.price || 0), 0);

    const handleSubmit = async () => {
        if (!selectedVehicle) {
            toast.error("Lütfen bir araç seçin.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the Service Record
            const recordResponse = await apiClient.post("/ServiceRecords", {
                vehicleId: selectedVehicle.id,
                notes: notes
            });

            if (recordResponse.data.success) {
                const recordId = recordResponse.data.data.id;

                // 2. Add Operations sequentially or in parallel
                const operationPromises = operations
                    .filter(op => op.description.trim() !== "")
                    .map(op => apiClient.post("/ServiceRecords/operation", {
                        serviceRecordId: recordId,
                        userId: op.userId,
                        operationDescription: op.description,
                        laborPrice: op.price
                    }));

                await Promise.all(operationPromises);

                toast.success("Servis fişi ve işlemler başarıyla kaydedildi.");
                router.push("/records");
            }
        } catch (error: any) {
            toast.error(error.message || "Fiş oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Yeni Fiş Aç</h1>
                        <p className="text-sm text-zinc-500">Müşteri kabulü ve iş emri oluşturma</p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    Fişi Kaydet
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Panel: Araç Seçimi */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-md font-bold mb-4 flex items-center gap-2">
                            <Car className="text-blue-500" size={18} />
                            Araç Seçimi
                        </h2>

                        {!selectedVehicle ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Plaka veya araç ara..."
                                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 ring-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => searchVehicles(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {vehicles.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVehicle(v)}
                                            className="w-full text-left p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{v.plateNumber}</div>
                                            <div className="text-xs text-zinc-500">{v.brand} {v.model}</div>
                                        </button>
                                    ))}
                                    {searchQuery.length >= 2 && vehicles.length === 0 && (
                                        <div className="text-xs text-center py-4 text-zinc-400">Sonuç bulunamadı</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 relative">
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="absolute top-2 right-2 text-blue-600 hover:text-blue-700 text-xs font-bold"
                                >
                                    Değiştir
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 flex items-center justify-center rounded-lg text-blue-600">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{selectedVehicle.plateNumber}</div>
                                        <div className="text-xs text-zinc-500">{selectedVehicle.brand} {selectedVehicle.model}</div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <User size={12} />
                                    {selectedVehicle.customerPhone}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-md font-bold mb-4 flex items-center gap-2">
                            <FileText className="text-amber-500" size={18} />
                            Genel Notlar
                        </h2>
                        <textarea
                            rows={4}
                            placeholder="Müşteri şikayeti, tespit edilen genel durumlar..."
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 ring-blue-500 resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </section>
                </div>

                {/* Sağ Panel: İşlem Kalemleri */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Wrench className="text-emerald-500" size={20} />
                                İşlem Kalemleri
                            </h2>
                            <Button variant="outline" size="sm" onClick={addOperation} className="rounded-xl border-zinc-200 dark:border-zinc-700">
                                <Plus size={16} className="mr-1" /> Satır Ekle
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {operations.map((op, idx) => (
                                <div key={op.id} className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl relative group">
                                    <button
                                        onClick={() => removeOperation(op.id)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <div className="flex-1 space-y-1.5 relative">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">İşlem Bilgisi</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: Yağ Filtresi Değişimi"
                                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:ring-2 ring-blue-500"
                                            value={op.description}
                                            onChange={(e) => updateOperation(op.id, "description", e.target.value)}
                                            onFocus={() => op.suggestions && op.suggestions.length > 0 && updateOperation(op.id, "showSuggestions", true)}
                                            onBlur={() => setTimeout(() => updateOperation(op.id, "showSuggestions", false), 200)}
                                        />

                                        {op.showSuggestions && op.suggestions && op.suggestions.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                                                {op.suggestions.map((p: any) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()} // blur engelle
                                                        onClick={() => selectProduct(op.id, p)}
                                                        className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-50 dark:border-zinc-800 last:border-0 flex justify-between items-center group"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">{p.name}</div>
                                                            <div className="text-[10px] text-zinc-400 font-mono">{p.code || 'KODSUZ'}</div>
                                                        </div>
                                                        <div className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                                                            ₺{p.price.toLocaleString()}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full md:w-48 space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Usta / Personel</label>
                                        <select
                                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm focus:ring-2 ring-blue-500"
                                            value={op.userId}
                                            onChange={(e) => updateOperation(op.id, "userId", e.target.value)}
                                        >
                                            <option value="">Atanmamış</option>
                                            {staff.map(s => (
                                                <option key={s.id} value={s.id}>{s.fullName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="w-full md:w-32 space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Fiyat (TL)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-right focus:ring-2 ring-blue-500"
                                            value={op.price}
                                            onChange={(e) => updateOperation(op.id, "price", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-5 bg-zinc-900 dark:bg-zinc-950 rounded-2xl flex items-center justify-between text-white">
                            <div>
                                <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tahmini Toplam</div>
                                <div className="text-2xl font-black text-white mt-0.5">
                                    {totalAmount.toLocaleString('tr-TR')} ₺
                                </div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                <CheckCircle2 className="text-emerald-400" size={24} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
