"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Beaker, Edit2, Trash2, Droplet, X, AlertCircle, FileText } from 'lucide-react';

export default function FormulasPage() {
    const [formulas, setFormulas] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFormulas();
    }, []);

    const fetchFormulas = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            // Filter products that have a formula
            const formulaProducts = data.filter((p: any) => p.isFormula && p.formula);
            setFormulas(formulaProducts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFormulas = formulas.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-gray-400">Memuat data formula...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text tracking-tighter">Manajemen Formula</h1>
                    <p className="text-gray-400 mt-1 break-words">Kelola resep dan komposisi bahan baku untuk setiap racikan parfum.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="bg-surface border border-border px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all text-sm"
                        onClick={() => window.location.href = '/dashboard/products'}
                    >
                        <Plus size={18} />
                        Tambah Formula (via Produk)
                    </button>
                </div>
            </header>

            <div className="mb-8">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama formula..."
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-accent-gold transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFormulas.map((product) => (
                    <div key={product.id} className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 blur-2xl -mr-8 -mt-8" />

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                <Beaker className="text-accent-gold" size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-background/50 px-2 py-1 rounded-md border border-border">
                                {product.formula?.items?.length || 0} BAHAN
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-1 break-words">{product.name}</h3>
                        <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest font-bold">Produk: {product.name}</p>

                        <div className="space-y-3 mb-6">
                            <p className="text-[10px] font-bold text-accent-gold/70 uppercase tracking-tighter mb-2">Komposisi Bahan</p>
                            <div className="space-y-2">
                                {product.formula?.items?.map((fi: any) => (
                                    <div key={fi.id} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Droplet size={12} className="text-gray-500" />
                                            <span className="text-gray-300">{fi.ingredient?.name}</span>
                                        </div>
                                        <span className="font-mono font-bold text-accent-gold">{fi.quantity}{fi.ingredient?.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center">
                            <button
                                onClick={() => window.location.href = `/dashboard/products`}
                                className="text-xs font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Edit2 size={12} />
                                Edit di Produk
                            </button>
                            <div className="flex items-center gap-1 text-accent-emerald text-[10px] font-black uppercase">
                                <FileText size={12} />
                                Formula Aktif
                            </div>
                        </div>
                    </div>
                ))}

                {filteredFormulas.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 glass-panel rounded-2xl">
                        <Beaker size={48} className="mx-auto mb-4 opacity-10" />
                        <p>Tidak ada formula ditemukan.</p>
                        <p className="text-xs mt-2">Pastikan Anda telah menambahkan produk dengan tipe 'Formula'.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
