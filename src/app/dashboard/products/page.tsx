"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Edit2, Trash2, Beaker, X, AlertCircle, ShoppingBag, Eye } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialForm = {
        name: '',
        price: '',
        stock: '0',
        isFormula: false,
        formulaItems: [{ ingredientId: '', productId: '', quantity: '' }]
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [prodRes, ingRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/ingredients')
        ]);
        const prodData = await prodRes.json();
        const ingData = await ingRes.json();
        setProducts(prodData);
        setAllProducts(prodData);
        setIngredients(ingData);
    };

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: any) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            isFormula: product.isFormula,
            formulaItems: product.formula?.items?.map((item: any) => ({
                ingredientId: item.ingredientId,
                productId: item.productId,
                quantity: item.quantity.toString()
            })) || []
        });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (product: any) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const addFormulaItem = () => {
        setFormData({
            ...formData,
            formulaItems: [...formData.formulaItems, { ingredientId: '', productId: '', quantity: '' }]
        });
    };

    const updateFormulaItem = (index: number, updates: Record<string, string>) => {
        setFormData(prev => {
            const newItems = [...prev.formulaItems];
            newItems[index] = { ...newItems[index], ...updates };
            return { ...prev, formulaItems: newItems };
        });
    };

    const removeFormulaItem = (index: number) => {
        setFormData({
            ...formData,
            formulaItems: formData.formulaItems.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
            const method = selectedProduct ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);
        try {
            await fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text">Produk & Katalog</h1>
                    <p className="text-gray-400 mt-1 break-words">Kelola produk jadi, racikan (formula), dan katalog menu untuk pelanggan.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => window.location.href = '/dashboard/menu'}
                        className="bg-surface border border-border px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all text-sm"
                    >
                        <Eye size={18} />
                        Lihat Katalog (Mode Menu)
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-foreground text-background px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-gold transition-all text-sm"
                    >
                        <Plus size={20} />
                        Tambah Produk
                    </button>
                </div>
            </header>

            {/* Filter & Search */}
            <div className="mb-8 flex gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-accent-gold transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
                    <div key={product.id} className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                <Package className="text-accent-gold" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenEdit(product)}
                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleOpenDelete(product)}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                        <p className="text-accent-emerald font-semibold mb-4 text-sm">Rp {parseFloat(product.price).toLocaleString('id-ID')}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Komposisi</span>
                            <span className="text-xs font-bold text-gray-300">
                                Stok: {product.stock} {product.isFormula ? '(ml)' : ''}
                            </span>
                        </div>

                        {product.isFormula && product.formula?.items && (
                            <div className="mt-3 space-y-2">
                                {product.formula.items.length === 0 ? (
                                    <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10 animate-pulse">
                                        <AlertCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Formula Kosong!</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {product.formula.items.slice(0, 3).map((fi: any) => (
                                            <span key={fi.id} className="text-[10px] bg-background border border-border px-2 py-0.5 rounded text-gray-400">
                                                {fi.ingredient?.name || fi.product?.name} {fi.quantity}{fi.ingredient?.unit || 'ml'}
                                            </span>
                                        ))}
                                        {product.formula.items.length > 3 && <span className="text-[10px] text-gray-600">+{product.formula.items.length - 3} lagi</span>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        Belum ada produk yang didaftarkan.
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-8 animate-scale-in">
                        <div className="p-6 border-b border-border bg-surface/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Beaker className="text-accent-gold" size={20} />
                                {selectedProduct ? 'Edit Produk / Racikan' : 'Tambah Produk / Racikan Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Nama Produk</label>
                                        <input
                                            required
                                            placeholder="Contoh: Midnight Oud (30ml)"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Harga Jual (Rp)</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                                        <div>
                                            <span className="block text-sm font-medium">Berbasis Formula?</span>
                                            <span className="text-[10px] text-gray-500">Stok bahan otomatis berkurang</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isFormula}
                                                onChange={e => setFormData({ ...formData, isFormula: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
                                        </label>
                                    </div>
                                    {!formData.isFormula && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Stok Produk Jadi</label>
                                            <input
                                                type="number"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                                value={formData.stock}
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {formData.isFormula && (
                                <div className="space-y-4 border-t border-border pt-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent-gold">Komposisi Formula</h3>
                                        <button
                                            type="button"
                                            onClick={addFormulaItem}
                                            className="text-xs bg-surface border border-border px-3 py-1.5 rounded-lg hover:border-accent-gold transition-all"
                                        >
                                            + Bahan
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.formulaItems.map((fi, index) => (
                                            <div key={index} className="flex gap-3 items-end animate-fade-in">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-gray-500 mb-1 uppercase">Bahan Baku / Produk Dasar</label>
                                                    <select
                                                        required
                                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-gold"
                                                        value={fi.ingredientId ? `ing:${fi.ingredientId}` : fi.productId ? `prod:${fi.productId}` : ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val.startsWith('ing:')) {
                                                                updateFormulaItem(index, {
                                                                    ingredientId: val.replace('ing:', ''),
                                                                    productId: ''
                                                                });
                                                            } else if (val.startsWith('prod:')) {
                                                                updateFormulaItem(index, {
                                                                    productId: val.replace('prod:', ''),
                                                                    ingredientId: ''
                                                                });
                                                            } else {
                                                                updateFormulaItem(index, {
                                                                    ingredientId: '',
                                                                    productId: ''
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Pilih Sumber...</option>
                                                        <optgroup label="Bahan Baku (Biang/Alkohol)">
                                                            {ingredients.map(i => (
                                                                <option key={i.id} value={`ing:${i.id}`}>{i.name} ({i.unit})</option>
                                                            ))}
                                                        </optgroup>
                                                        <optgroup label="Produk Lain (Parfum Dasar)">
                                                            {allProducts.filter(p => !selectedProduct || p.id !== selectedProduct.id).map(p => (
                                                                <option key={p.id} value={`prod:${p.id}`}>{p.name} (ml)</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[10px] text-gray-500 mb-1 uppercase">Jumlah</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-gold"
                                                        value={fi.quantity}
                                                        onChange={e => updateFormulaItem(index, { quantity: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFormulaItem(index)}
                                                    className="p-2 text-gray-500 hover:text-red-500"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-accent-gold transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center animate-scale-in">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Hapus Produk?</h3>
                        <p className="text-gray-400 mb-8 text-sm">Tindakan ini tidak dapat dibatalkan. Menghapus produk tidak akan menghapus riwayat transaksi sebelumnya.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
