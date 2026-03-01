"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
    ArrowLeft, Car, User, Wrench, CreditCard, Banknote,
    Building2, Printer, CheckCircle, Clock, AlertTriangle,
    X, Save, Plus
} from "lucide-react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ServiceRecord {
    id: string;
    vehicleId: string;
    vehicle: {
        id: string;
        plateNumber: string;
        brand: string;
        model: string;
        year?: number;
        customer?: { fullName: string; phone: string; }
    };
    arrivalDate: string;
    deliveryDate?: string;
    status: string;
    notes: string;
    operations: {
        id: string;
        operationDescription: string;
        assignedUserName: string;
        laborPrice: number;
        createdAt: string;
    }[];
    payments: {
        id: string;
        amount: number;
        method: number;
        methodName: string;
        paidAt: string;
        notes?: string;
    }[];
    totalLaborPrice: number;
    totalPaid: number;
    balanceDue: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    "Bekliyor": { label: "Bekliyor", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Clock size={14} /> },
    "İşlemde": { label: "İşlemde", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Wrench size={14} /> },
    "Tamamlandı": { label: "Tamamlandı", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle size={14} /> },
};

export default function RecordDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [record, setRecord] = useState<ServiceRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [payment, setPayment] = useState({ amount: 0, method: 1, notes: "" });
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const fetchRecord = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/ServiceRecords/${id}`);
            if (response.data.success) setRecord(response.data.data);
        } catch (error) {
            toast.error("Fiş bilgileri yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchRecord();
    }, [id]);

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPayment(true);
        try {
            const response = await apiClient.post("/Payments", {
                serviceRecordId: id,
                amount: payment.amount,
                method: payment.method,
                notes: payment.notes
            });
            if (response.data.success) {
                toast.success("Ödeme kaydedildi.");
                setIsPaymentModalOpen(false);
                setPayment({ amount: 0, method: 1, notes: "" });
                fetchRecord();
            }
        } catch (error) {
            toast.error("Ödeme kaydedilemedi.");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await apiClient.put("/ServiceRecords/status", {
                id,
                status: newStatus,
                deliveryDate: newStatus === "Tamamlandı" ? new Date().toISOString() : null,
                notes: record?.notes
            });
            toast.success(`Durum "${newStatus}" olarak güncellendi.`);
            fetchRecord();
        } catch {
            toast.error("Durum güncellenemedi.");
        }
    };

    if (isLoading) return (
        <div className="space-y-6">
            <Skeleton className="h-16 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-64 lg:col-span-2 rounded-3xl" />
            </div>
        </div>
    );

    if (!record) return (
        <div className="text-center py-20">
            <AlertTriangle className="mx-auto mb-4 text-amber-400" size={48} />
            <h2 className="text-xl font-bold">Fiş bulunamadı</h2>
        </div>
    );

    const statusInfo = STATUS_MAP[record.status] || STATUS_MAP["Bekliyor"];

    return (
        <>
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                Fiş Detayı
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                    {statusInfo.icon} {statusInfo.label}
                                </span>
                            </h1>
                            <p className="text-sm text-zinc-500">{record.vehicle?.plateNumber} • {format(new Date(record.arrivalDate), "d MMMM yyyy", { locale: tr })}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl gap-2 no-print" onClick={() => window.print()}>
                            <Printer size={18} /> Yazdır
                        </Button>
                        {record.status !== "Tamamlandı" && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl no-print"
                                onClick={() => handleStatusChange("Tamamlandı")}
                            >
                                <CheckCircle size={18} className="mr-2" /> Teslim Et
                            </Button>
                        )}
                    </div>
                </div>

                <div id="print-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sol: Araç ve Müşteri */}
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-sm uppercase text-zinc-400 tracking-wider mb-4">Araç Bilgileri</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Car size={28} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{record.vehicle?.plateNumber}</p>
                                    <p className="text-sm text-zinc-500">{record.vehicle?.brand} {record.vehicle?.model}</p>
                                </div>
                            </div>
                            {record.vehicle?.customer && (
                                <div className="mt-5 pt-5 border-t border-zinc-50 dark:border-zinc-800 flex items-center gap-3">
                                    <User className="text-zinc-400 shrink-0" size={18} />
                                    <div>
                                        <p className="font-bold text-sm">{record.vehicle.customer.fullName}</p>
                                        <p className="text-xs text-zinc-400">{record.vehicle.customer.phone}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Ödeme Özeti */}
                        <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm uppercase text-zinc-400 tracking-wider">Tahsilat</h3>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 no-print"
                                >
                                    <Plus size={14} /> Ödeme Al
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">İşçilik Toplamı</span>
                                    <span className="font-bold">₺{record.totalLaborPrice.toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Tahsil Edilen</span>
                                    <span className="font-bold text-emerald-600">₺{record.totalPaid.toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                                    <span className="font-bold">Kalan Borç</span>
                                    <span className={`font-black text-xl ${record.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ₺{record.balanceDue.toLocaleString('tr-TR')}
                                    </span>
                                </div>
                            </div>

                            {record.payments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Ödeme Geçmişi</p>
                                    {record.payments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                                            <div>
                                                <span className="font-bold">{p.methodName}</span>
                                                <span className="text-zinc-400 text-xs block">{format(new Date(p.paidAt), "d MMM yyyy", { locale: tr })}</span>
                                            </div>
                                            <span className="font-bold text-emerald-600">₺{p.amount.toLocaleString('tr-TR')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sağ: İşlem Kalemleri */}
                    <div className="lg:col-span-2">
                        <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-sm uppercase text-zinc-400 tracking-wider mb-6">İşlem Kalemleri</h3>

                            {record.operations.length === 0 ? (
                                <div className="py-10 text-center text-zinc-400">İşlem kalemi bulunamadı.</div>
                            ) : (
                                <div className="space-y-3">
                                    {record.operations.map((op, i) => (
                                        <div key={op.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{op.operationDescription}</p>
                                                    <p className="text-xs text-zinc-500">{op.assignedUserName || "Atanmamış"}</p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 ml-4">
                                                ₺{op.laborPrice.toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="mt-6 p-5 bg-zinc-900 dark:bg-black rounded-2xl flex items-center justify-between text-white">
                                        <div>
                                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Toplam İşçilik</p>
                                            <p className="text-3xl font-black mt-0.5">₺{record.totalLaborPrice.toLocaleString('tr-TR')}</p>
                                        </div>
                                        <div className={`text-right ${record.balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            <p className="text-xs font-bold uppercase tracking-wider">
                                                {record.balanceDue > 0 ? 'Ödenmemiş' : '✓ Tahsil Edildi'}
                                            </p>
                                            <p className="text-xl font-black mt-0.5">₺{record.totalPaid.toLocaleString('tr-TR')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {record.notes && (
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">Notlar</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{record.notes}</p>
                                </div>
                            )}
                        </section>

                        {/* Durum Değiştir */}
                        <div className="mt-4 flex gap-3 no-print">
                            {["Bekliyor", "İşlemde", "Tamamlandı"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${record.status === s ? STATUS_MAP[s]?.color + " border-transparent" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ödeme Alma Modalı */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Ödeme Al</h2>
                            <button onClick={() => setIsPaymentModalOpen(false)}><X size={20} className="text-zinc-400" /></button>
                        </div>
                        <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Tutar (TL)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-xl font-black font-mono focus:ring-2 ring-blue-500 text-center"
                                    placeholder={`${record.balanceDue.toLocaleString('tr-TR')}`}
                                    value={payment.amount || ""}
                                    onChange={e => setPayment({ ...payment, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Ödeme Yöntemi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: 1, label: "Nakit", icon: <Banknote size={18} /> },
                                        { val: 2, label: "Kredi Kartı", icon: <CreditCard size={18} /> },
                                        { val: 3, label: "Havale/EFT", icon: <Building2 size={18} /> },
                                        { val: 4, label: "Diğer", icon: null },
                                    ].map(m => (
                                        <button
                                            key={m.val}
                                            type="button"
                                            onClick={() => setPayment({ ...payment, method: m.val })}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${payment.method === m.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-transparent'}`}
                                        >
                                            {m.icon} {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Not (İsteğe Bağlı)</label>
                                <input
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-blue-500"
                                    placeholder="Örn: Peşin, geçirme..."
                                    value={payment.notes}
                                    onChange={e => setPayment({ ...payment, notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 rounded-xl">İptal</Button>
                                <Button type="submit" disabled={isSavingPayment} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                    <Save className="mr-2" size={18} />
                                    Ödemeyi Kaydet
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
