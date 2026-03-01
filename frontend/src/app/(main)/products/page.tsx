"use client";

import { useEffect, useState } from "react";
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
    Database,
    AlertCircle,
    LayoutGrid,
    Settings2,
    Wrench,
    Save,
    X
} from "lucide-react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    code: string | null;
    price: number;
    stockQuantity: number;
    type: number; // 1: Part, 2: Service
    typeName: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get("/Products");
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            toast.error("Ürünler yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingProduct?.id ? "put" : "post";
            const response = await apiClient[method]("/Products", editingProduct);

            if (response.data.success) {
                toast.success(editingProduct?.id ? "Ürün güncellendi." : "Ürün eklendi.");
                setIsModalOpen(false);
                setEditingProduct(null);
                fetchProducts();
            }
        } catch (error) {
            toast.error("İşlem başarısız.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            const response = await apiClient.delete(`/Products/${id}`);
            if (response.data.success) {
                toast.success("Ürün silindi.");
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                        <Package className="text-blue-600 dark:text-blue-500" />
                        Katalog ve Envanter
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Yedek parça ve sunduğunuz hizmetleri buradan yönetebilirsiniz.
                    </p>
                </div>
                <Button
                    onClick={() => { setEditingProduct({ type: 1, price: 0, stockQuantity: 0 }); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                    <Plus className="mr-2" size={18} />
                    Yeni Ürün/Hizmet
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ürün adı veya koduna göre ara..."
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 ring-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                        <AlertCircle className="mx-auto text-zinc-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold">Katalog Boş</h3>
                        <p className="text-zinc-500 text-sm">Henüz bir parça veya hizmet eklemediniz.</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl ${product.type === 1 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                                    {product.type === 1 ? <Database size={24} /> : <Wrench size={24} />}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-1">{product.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="secondary" className="rounded-lg font-medium text-[10px] uppercase tracking-wider">
                                        {product.code || "KODSUZ"}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-zinc-400">
                                        {product.type === 1 ? 'Parça' : 'Hizmet'}
                                    </Badge>
                                </div>

                                <div className="flex items-end justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Birim Fiyat</p>
                                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                                            ₺{product.price.toLocaleString()}
                                        </p>
                                    </div>
                                    {product.type === 1 && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">Stok</p>
                                            <p className={`text-sm font-bold ${product.stockQuantity < 5 ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                {product.stockQuantity} Adet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingProduct?.id ? 'Ürünü Düzenle' : 'Yeni Kayıt'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Tür</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct, type: 1 })}
                                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${editingProduct?.type === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-transparent'}`}
                                    >
                                        Yedek Parça
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct, type: 2 })}
                                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${editingProduct?.type === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-transparent'}`}
                                    >
                                        Hizmet
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Katalog Adı</label>
                                <input
                                    required
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-blue-500"
                                    value={editingProduct?.name || ""}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Kod / Barkod</label>
                                    <input
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-blue-500"
                                        value={editingProduct?.code || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Fiyat (TL)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm font-mono focus:ring-2 ring-blue-500"
                                        value={editingProduct?.price || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            {editingProduct?.type === 1 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Stok Miktarı</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm font-mono focus:ring-2 ring-blue-500"
                                        value={editingProduct?.stockQuantity || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl">İptal</Button>
                                <Button type="submit" className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl">
                                    <Save className="mr-2" size={18} />
                                    Kaydet
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
