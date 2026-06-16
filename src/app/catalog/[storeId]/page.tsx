"use client";

import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Store, MapPin, Phone, ShoppingBag, Sparkles, Package, Plus, Minus, X, Trash2 } from 'lucide-react';

export default function PublicCatalogPage({ params }: { params: { storeId: string } }) {
    const { storeId } = params;
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Interactive states
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'PRODUCT' | 'RESOURCE'>('ALL');
    
    // Shopping Cart states
    const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, isIngredient: boolean, stock: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        if (!storeId) return;

        fetch(`/api/catalog/${storeId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Toko tidak ditemukan atau gagal memuat data');
                }
                return res.json();
            })
            .then(data => {
                setStore(data.store);
                setProducts(data.products || []);
                setIngredients(data.ingredients || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || 'Terjadi kesalahan sistem');
                setLoading(false);
            });
    }, [storeId]);

    // Format phone number for WhatsApp URL (must start with country code, e.g. 62)
    const formatWhatsAppPhone = (phone: string) => {
        let clean = phone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) {
            clean = '62' + clean.slice(1);
        }
        return clean;
    };

    // Cart Handlers
    const addToCart = (item: any) => {
        const itemPrice = parseFloat(item.price);
        const existing = cart.find(c => c.id === item.id);
        
        if (existing) {
            if (existing.quantity >= item.stock) {
                alert(`Maaf, batas maksimum pemesanan produk ini adalah stok yang tersedia (${item.stock} unit).`);
                return;
            }
            setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            if (item.stock <= 0) {
                alert("Produk ini sedang habis.");
                return;
            }
            setCart([...cart, {
                id: item.id,
                name: item.name,
                price: itemPrice,
                quantity: 1,
                isIngredient: item.isIngredient,
                stock: item.stock
            }]);
        }
    };

    const decrementQuantity = (id: string) => {
        const existing = cart.find(c => c.id === id);
        if (!existing) return;

        if (existing.quantity > 1) {
            setCart(cart.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
        } else {
            setCart(cart.filter(c => c.id !== id));
        }
    };

    const removeItem = (id: string) => {
        setCart(cart.filter(c => c.id !== id));
    };

    const getItemQuantity = (id: string) => {
        return cart.find(c => c.id === id)?.quantity || 0;
    };

    const clearCart = () => {
        setCart([]);
        setIsCartOpen(false);
    };

    const totalItemsCount = cart.reduce((sum, c) => sum + c.quantity, 0);
    const totalCartAmount = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);

    const handleSendOrderWhatsApp = () => {
        if (cart.length === 0) return;
        if (!store || !store.phone) {
            alert("Nomor WhatsApp Toko belum dikonfigurasi di Pengaturan Toko. Silakan hubungi kasir atau pemilik toko secara langsung.");
            return;
        }

        const formattedPhone = formatWhatsAppPhone(store.phone);
        
        const itemsText = cart.map(c => 
            `- *${c.name}* (x${c.quantity}): Rp ${(c.price * c.quantity).toLocaleString('id-ID')}`
        ).join('\n');
        
        const message = `Halo *${store.name}*, saya ingin memesan beberapa produk dari katalog online Anda:

*Rincian Pesanan:*
${itemsText}

*Total Pembayaran:* *Rp ${totalCartAmount.toLocaleString('id-ID')}*

Apakah pesanan di atas ready untuk dipesan? Terima kasih!`;

        const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] text-[#F2F2F2] flex flex-col items-center justify-center p-6">
                <div className="w-10 h-10 border-4 border-accent-gold/25 border-t-accent-gold rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm animate-pulse">Memuat Katalog Toko...</p>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] text-[#F2F2F2] flex flex-col items-center justify-center p-6 text-center">
                <Store size={48} className="text-red-500/80 mb-4" />
                <h2 className="text-xl font-bold text-red-500 mb-2">Gagal Memuat Katalog</h2>
                <p className="text-gray-400 text-sm max-w-xs mb-6">{error || 'Toko tidak ditemukan.'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-white hover:border-accent-gold/40 transition-all"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    // Combine and label items for rendering
    const allItems = [
        ...products.map(p => ({ ...p, price: parseFloat(p.price), isIngredient: false })),
        ...ingredients.map(i => ({ ...i, price: parseFloat(i.price), isIngredient: true }))
    ];

    const filteredItems = allItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.code && item.code.toLowerCase().includes(search.toLowerCase()));

        if (activeTab === 'PRODUCT') return matchesSearch && !item.isIngredient;
        if (activeTab === 'RESOURCE') return matchesSearch && item.isIngredient;
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-[#F2F2F2] font-sans antialiased pb-28 flex justify-center">
            {/* Limit container to standard mobile view width for premium feeling */}
            <div className="w-full max-w-md bg-gradient-to-b from-[#0A0A0B] to-[#121214] min-h-screen border-x border-border/40 relative flex flex-col">
                
                {/* Store Branding Header Section */}
                <header className="p-6 pb-6 border-b border-border/40 bg-surface/30 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center border border-accent-gold/25 shadow-glass-gold shrink-0">
                            <Store className="text-accent-gold" size={24} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold">Katalog Toko</span>
                            <h1 className="text-lg font-black text-white truncate">{store.name}</h1>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-400">
                        {store.address && (
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-accent-gold/80 shrink-0 mt-0.5" />
                                <span className="break-words line-clamp-2">{store.address}</span>
                            </div>
                        )}
                        {store.phone && (
                            <a
                                href={`tel:${store.phone}`}
                                className="flex items-center gap-2 hover:text-white transition-colors w-fit"
                            >
                                <Phone size={14} className="text-accent-gold/80 shrink-0" />
                                <span>{store.phone}</span>
                            </a>
                        )}
                    </div>
                </header>

                <main className="p-5 flex-1 flex flex-col">
                    {/* Interactive Search Bar */}
                    <div className="relative mb-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Cari produk parfum..."
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-accent-gold/60 text-xs transition-all text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1.5 p-1 bg-surface/40 border border-border/60 rounded-xl mb-6">
                        {(['ALL', 'PRODUCT', 'RESOURCE'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all uppercase ${
                                    activeTab === tab
                                        ? 'bg-accent-gold text-background shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab === 'ALL' ? 'Semua' : tab === 'PRODUCT' ? 'Parfum' : 'Botol & Bahan'}
                            </button>
                        ))}
                    </div>

                    {/* Catalog Listing */}
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                            <span>Daftar Menu</span>
                            <span>{filteredItems.length} Item</span>
                        </div>

                        <div className="space-y-3">
                            {filteredItems.map((item) => {
                                const quantity = getItemQuantity(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="p-4 bg-surface/30 border border-border/40 rounded-2xl flex flex-col justify-between gap-3.5 hover:border-accent-gold/20 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                                                        item.isIngredient
                                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                                                            : 'bg-accent-gold/10 text-accent-gold border border-accent-gold/15'
                                                    }`}>
                                                        {item.isIngredient ? 'Bahan/Botol' : 'Parfum'}
                                                    </span>
                                                    {item.stock > 0 && item.stock <= 5 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/15 text-[9px] font-bold uppercase tracking-wider">
                                                            Stok Menipis
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-100 group-hover:text-accent-gold transition-colors break-words leading-snug">
                                                    {item.name}
                                                </h3>
                                                {item.code && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Kode: {item.code}</p>
                                                )}
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="font-black text-sm text-accent-emerald">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </div>
                                                <div className={`text-[10px] mt-0.5 font-bold ${
                                                    item.stock > 0 ? 'text-gray-400' : 'text-red-400/90'
                                                }`}>
                                                    {item.stock > 0 ? `Stok: ${item.stock}` : 'Stok Habis'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Cart Controls */}
                                        <div className="mt-1">
                                            {item.stock <= 0 ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2.5 bg-surface border border-border/40 rounded-xl font-bold text-[11px] text-gray-500 cursor-not-allowed"
                                                >
                                                    Stok Habis
                                                </button>
                                            ) : quantity === 0 ? (
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="w-full py-2.5 bg-surface hover:bg-accent-gold hover:text-background border border-border hover:border-accent-gold rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                                                >
                                                    <Plus size={12} />
                                                    Tambah ke Keranjang
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-between bg-surface border border-accent-gold/30 rounded-xl overflow-hidden p-1">
                                                    <button
                                                        onClick={() => decrementQuantity(item.id)}
                                                        className="p-2 hover:bg-accent-gold/10 text-accent-gold hover:text-white rounded-lg transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="font-bold text-xs text-white px-4">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="p-2 hover:bg-accent-gold/10 text-accent-gold hover:text-white rounded-lg transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredItems.length === 0 && (
                                <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-3">
                                    <Package size={32} className="text-gray-600" />
                                    <p className="text-sm">Tidak ada produk ditemukan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer Brand */}
                <footer className="p-6 text-center text-[10px] text-gray-600 border-t border-border/30 mt-auto bg-surface/5">
                    <p className="flex items-center justify-center gap-1 font-bold">
                        Powered by <Sparkles size={10} className="text-accent-gold" /> Aromix Perfume
                    </p>
                </footer>

                {/* Floating Bottom Cart Bar */}
                {totalItemsCount > 0 && (
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-background/90 backdrop-blur-md border-t border-border/60 z-50 animate-in slide-in-from-bottom duration-300">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full bg-accent-gold text-background p-4 rounded-2xl flex items-center justify-between font-black text-xs shadow-xl active:scale-[0.99] transition-transform"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <ShoppingBag size={18} />
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-accent-gold">
                                        {totalItemsCount}
                                    </span>
                                </div>
                                <span>Lihat Keranjang Belanja</span>
                            </div>
                            <span className="text-sm">Rp {totalCartAmount.toLocaleString('id-ID')}</span>
                        </button>
                    </div>
                )}

                {/* Shopping Cart Drawer Modal */}
                {isCartOpen && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end justify-center">
                        {/* Backdrop close */}
                        <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
                        
                        <div className="w-full max-w-md bg-[#121214] border-t border-border rounded-t-[2rem] p-6 space-y-5 relative z-10 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="text-accent-gold" size={20} />
                                    <h2 className="text-lg font-bold text-white">Keranjang Belanja</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={clearCart}
                                        className="text-gray-500 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={12} />
                                        Kosongkan
                                    </button>
                                    <button 
                                        onClick={() => setIsCartOpen(false)} 
                                        className="p-1 hover:bg-surface rounded-full text-gray-400 hover:text-white transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="space-y-3 overflow-y-auto flex-1 pr-1 py-1">
                                {cart.map((c) => (
                                    <div 
                                        key={c.id} 
                                        className="p-3 bg-surface/30 border border-border/40 rounded-xl flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-sm text-gray-200 truncate">{c.name}</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                {c.quantity} x Rp {c.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => decrementQuantity(c.id)}
                                                    className="p-1.5 hover:bg-accent-gold/10 text-accent-gold rounded-lg transition-colors"
                                                >
                                                    <Minus size={10} />
                                                </button>
                                                <span className="font-bold text-xs text-white px-2.5">
                                                    {c.quantity}
                                                </span>
                                                <button
                                                    onClick={() => addToCart(c)}
                                                    className="p-1.5 hover:bg-accent-gold/10 text-accent-gold rounded-lg transition-colors"
                                                >
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(c.id)}
                                                className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                                                title="Hapus item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals & Send WhatsApp Button */}
                            <div className="border-t border-border pt-4 space-y-4 shrink-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Belanja</span>
                                    <span className="text-xl font-black text-accent-emerald">
                                        Rp {totalCartAmount.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <button
                                    onClick={handleSendOrderWhatsApp}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
                                >
                                    <MessageCircle size={16} />
                                    Kirim Pesanan ke WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
