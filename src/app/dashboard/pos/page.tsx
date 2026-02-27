"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Droplets,
    UserPlus,
    X,
    Users
} from 'lucide-react';

// Product logic
export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Customer states
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', notes: '' });

    useEffect(() => {
        fetchProducts();
        fetchResources();
        fetchCustomers();
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

    const fetchCustomers = async () => {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingCustomer(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });
            const data = await res.json();
            if (res.ok) {
                setCustomers([...customers, data]);
                setSelectedCustomer(data);
                setIsCustomerModalOpen(false);
                setNewCustomer({ name: '', phone: '', email: '', notes: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAddingCustomer(false);
        }
    };

    const addToCart = (item: any) => {
        const id = `${item.id}-${Date.now()}`; // Unique ID for cart items
        setCart([...cart, {
            ...item,
            cartId: id,
            quantity: 1,
            isOwnBottle: false,
            bottleId: resources.find(r => r.type === 'BOTOL')?.id || null,
            isIngredient: !!item.isIngredient
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
                        productId: item.isIngredient ? null : item.id,
                        ingredientId: item.isIngredient ? item.id : null,
                        quantity: item.quantity,
                        isOwnBottle: item.isOwnBottle,
                        bottleId: item.bottleId
                    })),
                    customerId: selectedCustomer?.id || null
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Transaksi Berhasil! Invoice: ${data.invoiceNumber}`);
                setCart([]);
                setSelectedCustomer(null);
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
                <header className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold break-words">Kasir / POS</h1>

                        {/* Searchable Customer Selection */}
                        <div className="flex items-center gap-2 w-full sm:w-auto relative">
                            <div className="relative flex-1 sm:w-80">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari nama / telp pelanggan..."
                                    className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-10 text-sm focus:border-accent-gold outline-none transition-all"
                                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        if (selectedCustomer) setSelectedCustomer(null);
                                        setIsCustomerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsCustomerDropdownOpen(true)}
                                />
                                {selectedCustomer && (
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setCustomerSearch('');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {customers
                                            .filter(c =>
                                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                (c.phone && c.phone.includes(customerSearch))
                                            ).length > 0 ? (
                                            customers
                                                .filter(c =>
                                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    (c.phone && c.phone.includes(customerSearch))
                                                ).map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setCustomerSearch('');
                                                            setIsCustomerDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-background border-b border-border/50 last:border-0 transition-colors group"
                                                    >
                                                        <div className="font-medium group-hover:text-accent-gold">{c.name}</div>
                                                        {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                                                    </button>
                                                ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Pelanggan tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="p-2.5 bg-surface border border-border rounded-xl hover:text-accent-gold transition-colors"
                                title="Tambah Pelanggan Baru"
                            >
                                <UserPlus size={20} />
                            </button>

                            {/* Backdrop to close dropdown */}
                            {isCustomerDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsCustomerDropdownOpen(false)}
                                />
                            )}
                        </div>
                    </div>

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
                    {[
                        ...products.map(p => ({ ...p, price: parseFloat(p.price) })),
                        ...resources.filter(r => parseFloat(r.price) > 0).map(r => ({ ...r, price: parseFloat(r.price), isIngredient: true }))
                    ].filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                        <div
                            key={item.isIngredient ? `ing-${item.id}` : item.id}
                            onClick={() => addToCart(item)}
                            className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-accent-gold transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                    {item.isIngredient ? (
                                        <Plus className="text-accent-gold" />
                                    ) : (
                                        <Droplets className="text-accent-gold" />
                                    )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.stock < 10
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-accent-emerald/10 text-accent-emerald'
                                    }`}>
                                    {item.isFormula && <span className="text-[10px] opacity-70 mr-1">RACIKAN:</span>}
                                    {item.isIngredient && <span className="text-[10px] opacity-70 mr-1">{item.type}:</span>}
                                    Stok: {item.stock} {item.unit || ''}
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                            <p className="text-accent-gold font-bold">Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout Area */}
            <div className="w-full lg:w-[400px] glass-panel border-l-0 lg:border-l border-border flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Keranjang
                        </h2>
                        {selectedCustomer && (
                            <span className="text-xs text-accent-gold font-medium mt-1">
                                Pelanggan: {selectedCustomer.name}
                            </span>
                        )}
                    </div>
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

            {/* Customer Add Modal */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold">Tambah Pelanggan Baru</h2>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nomor Telepon</label>
                                <input
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Catatan</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold resize-none"
                                    rows={3}
                                    value={newCustomer.notes}
                                    onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingCustomer}
                                    className="flex-1 px-4 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-accent-gold transition-all disabled:opacity-50"
                                >
                                    {isAddingCustomer ? 'Menyimpan...' : 'Simpan Pelanggan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
