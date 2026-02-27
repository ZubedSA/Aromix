"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Droplets, Trash2, Edit2, AlertCircle, X, Briefcase, Package } from 'lucide-react';

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ name: '', unit: 'ml', stock: '0', type: 'BIANG', price: '0' });
    const [activeTab, setActiveTab] = useState('BIANG');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [ingRes, prodRes] = await Promise.all([
            fetch('/api/ingredients'),
            fetch('/api/products')
        ]);
        const ingData = await ingRes.json();
        const prodData = await prodRes.json();
        setIngredients(ingData);
        setProducts(prodData.filter((p: any) => p.isFormula));
    };

    const fetchIngredients = fetchData; // Alias for backward compatibility if needed internally

    const handleOpenAdd = () => {
        setSelectedIngredient(null);
        setFormData({ name: '', unit: activeTab === 'BOTOL' ? 'pcs' : 'ml', stock: '0', type: activeTab, price: '0' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (ingredient: any) => {
        setSelectedIngredient(ingredient);
        setFormData({
            name: ingredient.name,
            unit: ingredient.unit,
            stock: ingredient.stock.toString(),
            type: ingredient.type,
            price: ingredient.price?.toString() || '0'
        });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (item: any) => {
        setSelectedIngredient(item);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = selectedIngredient ? `/api/ingredients/${selectedIngredient.id}` : '/api/ingredients';
            const method = selectedIngredient ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchIngredients();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedIngredient) return;
        setIsSubmitting(true);
        try {
            await fetch(`/api/ingredients/${selectedIngredient.id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            fetchIngredients();
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
                    <h1 className="text-3xl font-bold premium-gradient-text">Inventory / Stok</h1>
                    <p className="text-gray-400 mt-1 break-words">Kelola persediaan biang parfum dan hubungkan dengan pemasok.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => window.location.href = '/dashboard/suppliers'}
                        className="bg-surface border border-border px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all text-sm"
                    >
                        <Briefcase size={18} />
                        Daftar Pemasok
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-foreground text-background px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-gold transition-all text-sm"
                    >
                        <Plus size={20} />
                        Tambah Bahan
                    </button>
                </div>
            </header>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex bg-surface p-1 rounded-2xl border border-border">
                    {[
                        { id: 'BIANG', label: 'Biang Parfum' },
                        { id: 'ALCOHOL', label: 'Alkohol' },
                        { id: 'BOTOL', label: 'Stok Botol' },
                        { id: 'FORMULA_PRODUCT', label: 'Produk Racikan' },
                        { id: 'LAINNYA', label: 'Lain-lain' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-foreground text-background shadow-lg'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder={`Cari di ${activeTab === 'BIANG' ? 'Biang' : activeTab}...`}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-accent-gold transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background/50 text-gray-400 text-sm border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Nama Bahan</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Stok</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Satuan</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Harga Jual</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {activeTab === 'FORMULA_PRODUCT' ? (
                                products
                                    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                                    .map((item) => (
                                        <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-background rounded-lg border border-border">
                                                        <Package className="text-accent-gold" size={20} />
                                                    </div>
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${item.stock < 10 ? 'text-red-400' : 'text-accent-emerald'}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">ml</td>
                                            <td className="px-6 py-4">
                                                <span className="text-accent-gold font-bold">
                                                    Rp {parseFloat(item.price || 0).toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 text-xs text-gray-500 italic">
                                                    Kelola di menu Produk
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                ingredients
                                    .filter(i => (i.type === activeTab) && i.name.toLowerCase().includes(search.toLowerCase()))
                                    .map((item) => (
                                        <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-background rounded-lg border border-border">
                                                        <Droplets className="text-accent-gold" />
                                                    </div>
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${item.stock < 100 ? 'text-red-400' : 'text-accent-emerald'}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{item.unit}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-accent-gold font-bold">
                                                    Rp {parseFloat(item.price || 0).toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-2 text-gray-400 hover:text-accent-gold transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDelete(item)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                            {ingredients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        Belum ada bahan baku.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold">{selectedIngredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Bahan</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="BIANG">Biang Parfum</option>
                                        <option value="ALCOHOL">Alkohol / Campuran</option>
                                        <option value="BOTOL">Botol</option>
                                        <option value="LAINNYA">Lain-lain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Satuan</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                        <option value="gr">gr</option>
                                        <option value="drop">drop</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Stok Saat Ini</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Harga Jual (0 jika tidak dijual)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
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
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}
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
                        <h3 className="text-xl font-bold mb-2">Hapus Bahan Baku?</h3>
                        <p className="text-gray-400 mb-8 text-sm">Tindakan ini tidak dapat dibatalkan. Pastikan bahan ini tidak sedang digunakan dalam formula produk.</p>
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
