"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Droplets, Info, Star, ChevronRight } from 'lucide-react';

export default function MenuKatalogPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-gray-400">Menyiapkan katalog menu...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10 relative">
            <header className="mb-12">
                <h1 className="text-4xl font-black italic premium-gradient-text tracking-tighter uppercase mb-2">Katalog Menu</h1>
                <p className="text-gray-400">Daftar koleksi parfum eksklusif dan racikan tanda tangan kami.</p>
            </header>

            <div className="mb-10">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Cari parfum favorit Anda..."
                        className="w-full bg-surface border border-border rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-accent-gold transition-all text-lg shadow-glass-gold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="glass-panel group rounded-[2.5rem] overflow-hidden hover:border-accent-gold/50 transition-all duration-500">
                        {/* Fake Image Placeholder with Gradient */}
                        <div className="h-48 bg-gradient-to-br from-surface to-background flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-accent-gold/5 group-hover:bg-accent-gold/10 transition-colors" />
                            <Droplets size={64} className="text-accent-gold/20 group-hover:scale-110 group-hover:text-accent-gold/40 transition-all duration-700" />
                            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border flex items-center gap-1">
                                <Star size={12} className="text-accent-gold fill-accent-gold" />
                                <span className="text-[10px] font-bold text-white">PREMIUM</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold break-words pr-2">{product.name}</h3>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">Aroma</span>
                                <div className="flex-1 h-[1px] bg-border/50" />
                            </div>

                            <p className="text-gray-400 text-sm mb-8 line-clamp-2 italic">
                                "{product.isFormula ? 'Racikan eksklusif dengan komposisi bahan pilihan yang menghasilkan aroma tahan lama.' : 'Parfum siap pakai dengan karakter aroma yang kuat dan elegan.'}"
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Harga Satuan</p>
                                    <p className="text-2xl font-black text-accent-emerald tracking-tighter">
                                        Rp {parseFloat(product.price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <button className="w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center hover:bg-accent-gold transition-all shadow-premium group-hover:rotate-12">
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-4 bg-background/50 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                <ShoppingBag size={12} />
                                <span>TERSEDIA</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-32 text-center glass-panel rounded-[3rem]">
                        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                            <Info size={40} className="text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h2>
                        <p className="text-gray-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
