"use client";

import { useEffect, useState } from "react";
import {
    User, Lock, Building2, Save, Eye, EyeOff,
    CheckCircle, AlertCircle, Phone, Mail, ShieldCheck,
    Users, Plus, Pencil, Trash2, X, UserPlus, Shield
} from "lucide-react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
    firstName: string; lastName: string; email: string;
    phoneNumber: string | null; roles: string[];
}
interface StaffMember {
    id: string; firstName: string; lastName: string;
    email: string; phoneNumber: string | null; roles: string[];
}

type Tab = "profile" | "password" | "service" | "staff";

const ROLES = ["Admin", "Usta", "Danisman"];
const ROLE_STYLE: Record<string, string> = {
    Admin: "bg-purple-50 text-purple-700 border-purple-200",
    Usta: "bg-blue-50 text-blue-700 border-blue-200",
    Danisman: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-7 py-5 border-b border-zinc-50 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
            </div>
            <div className="p-7">{children}</div>
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-400";

// ── Personel Modal ─────────────────────────────────────────────────────────
function StaffModal({
    mode, staff, onClose, onSaved
}: {
    mode: "create" | "edit";
    staff?: StaffMember;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [firstName, setFirstName] = useState(staff?.firstName || "");
    const [lastName, setLastName] = useState(staff?.lastName || "");
    const [email, setEmail] = useState(staff?.email || "");
    const [phone, setPhone] = useState(staff?.phoneNumber || "");
    const [role, setRole] = useState(staff?.roles?.[0] || "Usta");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) { toast.error("Ad ve soyad zorunludur."); return; }
        if (mode === "create" && (!email.trim() || !password.trim())) { toast.error("E-posta ve şifre zorunludur."); return; }
        setIsSaving(true);
        try {
            if (mode === "create") {
                await apiClient.post("/Staff", { firstName, lastName, email, password, phoneNumber: phone, role });
                toast.success("Personel eklendi ✅");
            } else {
                await apiClient.put(`/Staff/${staff!.id}`, { firstName, lastName, phoneNumber: phone, role });
                toast.success("Personel güncellendi ✅");
            }
            onSaved();
            onClose();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "İşlem başarısız.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-50 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <UserPlus size={18} className="text-blue-600" />
                        {mode === "create" ? "Yeni Personel Ekle" : "Personel Düzenle"}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-7 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Ad">
                            <input className={inputClass} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ad" />
                        </FormField>
                        <FormField label="Soyad">
                            <input className={inputClass} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Soyad" />
                        </FormField>
                    </div>
                    {mode === "create" && (
                        <FormField label="E-posta">
                            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="personel@servis.com" />
                        </FormField>
                    )}
                    <FormField label="Telefon">
                        <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XX XXX XX XX" />
                    </FormField>
                    <FormField label="Rol">
                        <select className={inputClass} value={role} onChange={e => setRole(e.target.value)}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </FormField>
                    {mode === "create" && (
                        <FormField label="Şifre">
                            <div className="relative">
                                <input
                                    className={`${inputClass} pr-10`}
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="En az 6 karakter"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </FormField>
                    )}
                </div>
                <div className="px-7 pb-7 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-all">
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/25"
                    >
                        <Save size={15} />
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Profil
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    // Şifre
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);

    // Personel
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.get("/Auth/me");
                if (res.data.success) {
                    const p = res.data.data;
                    setProfile(p);
                    setFirstName(p.firstName || "");
                    setLastName(p.lastName || "");
                    setPhone(p.phoneNumber || "");
                }
            } catch { toast.error("Profil yüklenemedi."); }
            finally { setIsLoading(false); }
        })();
    }, []);

    const fetchStaff = async () => {
        setStaffLoading(true);
        try {
            const res = await apiClient.get("/Staff");
            if (res.data.success) setStaff(res.data.data || []);
        } catch { toast.error("Personel listesi yüklenemedi."); }
        finally { setStaffLoading(false); }
    };

    useEffect(() => {
        if (activeTab === "staff") fetchStaff();
    }, [activeTab]);

    const handleProfileSave = async () => {
        if (!firstName.trim() || !lastName.trim()) { toast.error("Ad ve soyad boş olamaz."); return; }
        setIsSaving(true);
        try {
            await apiClient.put("/Auth/me", { firstName, lastName, phoneNumber: phone });
            toast.success("Profil güncellendi ✅");
            setProfile(prev => prev ? { ...prev, firstName, lastName, phoneNumber: phone } : prev);
        } catch (e: any) { toast.error(e?.response?.data?.message || "Güncelleme başarısız."); }
        finally { setIsSaving(false); }
    };

    const handlePasswordChange = async () => {
        if (!currentPw || !newPw || !confirmPw) { toast.error("Tüm alanlar zorunludur."); return; }
        if (newPw !== confirmPw) { toast.error("Yeni şifreler eşleşmiyor."); return; }
        if (newPw.length < 6) { toast.error("Şifre en az 6 karakter olmalı."); return; }
        setIsSaving(true);
        try {
            await apiClient.post("/Auth/change-password", { currentPassword: currentPw, newPassword: newPw });
            toast.success("Şifre değiştirildi 🔐");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        } catch (e: any) { toast.error(e?.response?.data?.message || "Şifre değiştirilemedi."); }
        finally { setIsSaving(false); }
    };

    const handleDeleteStaff = async (id: string) => {
        try {
            await apiClient.delete(`/Staff/${id}`);
            toast.success("Personel silindi.");
            setStaff(prev => prev.filter(s => s.id !== id));
        } catch (e: any) { toast.error(e?.response?.data?.message || "Silme başarısız."); }
        finally { setDeleteConfirmId(null); }
    };

    const isAdmin = user?.roles?.includes("Admin");

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "profile", label: "Profil", icon: User },
        { key: "password", label: "Şifre", icon: Lock },
        { key: "service", label: "Servis", icon: Building2 },
        { key: "staff", label: "Personeller", icon: Users },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-3xl">

            {/* Modal */}
            {modalOpen && (
                <StaffModal
                    mode={modalMode}
                    staff={selectedStaff}
                    onClose={() => setModalOpen(false)}
                    onSaved={fetchStaff}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Ayarlar</h1>
                <p className="text-sm text-zinc-400 mt-0.5">Hesap, servis ve personel yönetimi</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === t.key
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                        <t.icon size={15} />{t.label}
                    </button>
                ))}
            </div>

            {/* ── Profil ───────────────────────────────────────────────── */}
            {activeTab === "profile" && (
                <SectionCard title="Kullanıcı Profili" icon={User}>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 rounded-2xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0">
                                    {(firstName || "U")[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{firstName} {lastName}</p>
                                    <p className="text-sm text-zinc-400">{profile?.email}</p>
                                    <div className="flex gap-1 mt-1">
                                        {profile?.roles?.map(r => (
                                            <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLE[r] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>{r}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Ad"><input className={inputClass} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Adınız" /></FormField>
                                <FormField label="Soyad"><input className={inputClass} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Soyadınız" /></FormField>
                            </div>
                            <FormField label="E-posta (değiştirilemez)">
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input className={`${inputClass} pl-9 opacity-60 cursor-not-allowed`} value={profile?.email || ""} readOnly />
                                </div>
                            </FormField>
                            <FormField label="Telefon">
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input className={`${inputClass} pl-9`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XX XXX XX XX" />
                                </div>
                            </FormField>
                            <button onClick={handleProfileSave} disabled={isSaving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/25">
                                <Save size={16} />{isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* ── Şifre ────────────────────────────────────────────────── */}
            {activeTab === "password" && (
                <SectionCard title="Şifre Değiştir" icon={Lock}>
                    <div className="space-y-5">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">En az 6 karakter, büyük harf, sayı ve özel karakter önerilir.</p>
                        </div>
                        <FormField label="Mevcut Şifre">
                            <div className="relative">
                                <input className={`${inputClass} pr-10`} type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </FormField>
                        <FormField label="Yeni Şifre">
                            <input className={inputClass} type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
                        </FormField>
                        <FormField label="Yeni Şifre (Tekrar)">
                            <div className="relative">
                                <input className={`${inputClass} pr-10`} type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
                                {confirmPw && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {newPw === confirmPw ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-400" />}
                                    </span>
                                )}
                            </div>
                        </FormField>
                        <button onClick={handlePasswordChange} disabled={isSaving}
                            className="flex items-center gap-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-60 text-white dark:text-zinc-900 font-bold px-5 py-2.5 rounded-xl transition-all">
                            <ShieldCheck size={16} />{isSaving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                        </button>
                    </div>
                </SectionCard>
            )}

            {/* ── Servis Bilgileri ──────────────────────────────────────── */}
            {activeTab === "service" && (
                <SectionCard title="Servis Bilgileri" icon={Building2}>
                    <div className="space-y-5">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 dark:text-blue-300">Servis bilgileri fişlerde ve raporlarda görünür.</p>
                        </div>
                        <FormField label="Servis Adı"><input className={inputClass} defaultValue="Akın Oto Servis" /></FormField>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Vergi Numarası"><input className={inputClass} placeholder="0000000000" /></FormField>
                            <FormField label="Paket Tipi"><input className={`${inputClass} opacity-60 cursor-not-allowed`} value="Pro" readOnly /></FormField>
                        </div>
                        <FormField label="Adres"><textarea className={`${inputClass} resize-none h-20`} placeholder="Servis adresi" /></FormField>
                        <FormField label="Telefon"><input className={inputClass} placeholder="0212 XXX XX XX" /></FormField>
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                            <AlertCircle size={14} className="text-zinc-400 shrink-0" />
                            <p className="text-xs text-zinc-400">Servis bilgileri güncellemesi yakında aktif edilecektir.</p>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* ── Personeller ──────────────────────────────────────────── */}
            {activeTab === "staff" && (
                <SectionCard title="Servis Personelleri" icon={Users}>
                    <div className="space-y-5">
                        {/* Üst bar */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-500">{staff.length} personel kayıtlı</p>
                            {isAdmin && (
                                <button
                                    onClick={() => { setModalMode("create"); setSelectedStaff(undefined); setModalOpen(true); }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm shadow-blue-600/25"
                                >
                                    <Plus size={15} /> Personel Ekle
                                </button>
                            )}
                        </div>

                        {!isAdmin && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <Shield size={15} className="text-amber-500" />
                                <p className="text-xs text-amber-700">Personel eklemek ve düzenlemek için Admin yetkisi gereklidir.</p>
                            </div>
                        )}

                        {/* Liste */}
                        {staffLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
                            </div>
                        ) : staff.length === 0 ? (
                            <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                                <Users size={36} className="text-zinc-300 mx-auto mb-3" />
                                <p className="font-bold text-zinc-500">Personel bulunamadı</p>
                                <p className="text-xs text-zinc-400 mt-1">Yukarıdaki "Personel Ekle" butonunu kullanın.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {staff.map(s => (
                                    <div key={s.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                            {(s.firstName || "?")[0].toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{s.firstName} {s.lastName}</p>
                                            <p className="text-xs text-zinc-400 truncate">{s.email}</p>
                                        </div>
                                        {/* Rol badge */}
                                        <div className="hidden sm:flex gap-1 shrink-0">
                                            {s.roles.map(r => (
                                                <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLE[r] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>{r}</span>
                                            ))}
                                        </div>
                                        {/* Aksiyonlar - Sadece Admin */}
                                        {isAdmin && (
                                            <div className="flex gap-1 shrink-0">
                                                {deleteConfirmId === s.id ? (
                                                    <>
                                                        <button onClick={() => handleDeleteStaff(s.id)}
                                                            className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                                                            Sil
                                                        </button>
                                                        <button onClick={() => setDeleteConfirmId(null)}
                                                            className="text-xs font-bold bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-300 transition-colors">
                                                            İptal
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => { setModalMode("edit"); setSelectedStaff(s); setModalOpen(true); }}
                                                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Düzenle"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(s.id)}
                                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}
