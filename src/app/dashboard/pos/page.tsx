"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Droplets
} from 'lucide-react';

// Product logic
export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchResources();
    }, []);

    const fetchResources = async () => {
        const res = await fetch('/api/ingredients');
        const data = await res.json();
        setResources(data);
    };

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
    };

    const addToCart = (product: any) => {
        const id = `${product.id}-${Date.now()}`; // Unique ID for cart items to handle multiple versions of same product
        setCart([...cart, {
            ...product,
            cartId: id,
            quantity: 1,
            isOwnBottle: false,
            bottleId: resources.find(r => r.type === 'BOTOL')?.id || null
        }]);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        isOwnBottle: item.isOwnBottle,
                        bottleId: item.bottleId
                    }))
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Transaksi Berhasil! Invoice: ${data.invoiceNumber}`);
                setCart([]);
                fetchProducts(); // Refresh stock
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setIsProcessing(false);
        }
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const updateItem = (cartId: string, updates: any) => {
        setCart(cart.map(item => item.cartId === cartId ? { ...item, ...updates } : item));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
            {/* Product Selection Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold mb-4 break-words">Kasir / POS</h1>
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Cari parfum atau scan barcode..."
                            className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 focus:border-accent-gold outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart({ ...product, price: parseFloat(product.price) })}
                            className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-accent-gold transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                    <Droplets className="text-accent-gold" />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${product.isFormula
                                    ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/20'
                                    : product.stock < 10
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-accent-emerald/10 text-accent-emerald'
                                    }`}>
                                    {product.isFormula ? 'FORMULA RACIKAN' : `Stok: ${product.stock}`}
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                            <p className="text-accent-gold font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout Area */}
            <div className="w-full lg:w-[400px] glass-panel border-l-0 lg:border-l border-border flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Keranjang
                    </h2>
                    <span className="bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded-md">
                        {cart.length} ITEM
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p>Belum ada produk</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartId} className="bg-surface rounded-xl p-4 border border-border space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-bold text-sm">{item.name}</span>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-500 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center bg-background rounded-lg border border-border p-2">
                                    <span className="text-xs text-gray-500">Jumlah (ml/pcs)</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateItem(item.cartId, { quantity: Math.max(0, item.quantity - 1) })} className="p-1 hover:text-accent-gold"><Minus size={14} /></button>
                                        <input
                                            type="number"
                                            className="bg-transparent w-12 text-center text-sm outline-none"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.cartId, { quantity: parseFloat(e.target.value) || 0 })}
                                        />
                                        <button onClick={() => updateItem(item.cartId, { quantity: item.quantity + 1 })} className="p-1 hover:text-accent-gold"><Plus size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={item.isOwnBottle}
                                            onChange={(e) => updateItem(item.cartId, { isOwnBottle: e.target.checked })}
                                            className="w-4 h-4 rounded border-border bg-background text-accent-gold focus:ring-accent-gold"
                                        />
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bawa Botol Sendiri</span>
                                    </label>
                                    {!item.isOwnBottle && (
                                        <select
                                            className="bg-background border border-border rounded text-[10px] px-2 py-1 outline-none font-bold"
                                            value={item.bottleId || ''}
                                            onChange={(e) => updateItem(item.cartId, { bottleId: e.target.value })}
                                        >
                                            <option value="">Pilih Botol...</option>
                                            {resources.filter(r => r.type === 'BOTOL').map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="flex justify-end pt-1">
                                    <span className="font-bold text-sm text-accent-gold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 pb-28 md:pb-6 bg-surface border-t border-border">
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-400">Total Harga</span>
                        <span className="text-2xl font-bold text-accent-gold">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                        className="w-full bg-foreground text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50 disabled:hover:bg-foreground"
                    >
                        {isProcessing ? 'Memproses...' : (
                            <>
                                <CheckCircle2 size={20} />
                                Bayar Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
