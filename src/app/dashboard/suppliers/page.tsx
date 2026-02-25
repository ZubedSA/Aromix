"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Briefcase, MapPin, Phone, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ name: '', contact: '', address: '' });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        const res = await fetch('/api/suppliers');
        const data = await res.json();
        setSuppliers(Array.isArray(data) ? data : []);
    };

    const handleOpenAdd = () => {
        setSelectedSupplier(null);
        setFormData({ name: '', contact: '', address: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setSelectedSupplier(item);
        setFormData({ name: item.name, contact: item.contact || '', address: item.address || '' });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (item: any) => {
        setSelectedSupplier(item);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = selectedSupplier ? `/api/suppliers/${selectedSupplier.id}` : '/api/suppliers';
            const method = selectedSupplier ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSupplier) return;
        setIsSubmitting(true);
        try {
            await fetch(`/api/suppliers/${selectedSupplier.id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text tracking-tighter">Pemasok (Suppliers)</h1>
                    <p className="text-gray-400 mt-1 break-words">Daftar kontak pemasok bahan baku parfum.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-foreground text-background px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-gold transition-all"
                >
                    <Plus size={20} />
                    Tambah Pemasok
                </button>
            </header>

            <div className="mb-8 flex gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari pemasok..."
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-accent-gold transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                <Briefcase className="text-accent-gold" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEdit(supplier)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleOpenDelete(supplier)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-4">{supplier.name}</h3>

                        <div className="space-y-3">
                            {supplier.contact && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Phone size={14} className="text-accent-emerald" />
                                    <span>{supplier.contact}</span>
                                </div>
                            )}
                            {supplier.address && (
                                <div className="flex items-start gap-2 text-sm text-gray-400">
                                    <MapPin size={14} className="text-red-400 mt-0.5" />
                                    <span>{supplier.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredSuppliers.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        {suppliers.length === 0 ? "Belum ada pemasok." : "Pemasok tidak ditemukan."}
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
                            <h2 className="text-xl font-bold">{selectedSupplier ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Pemasok</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Kontak (Telp/WA)</label>
                                <input
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Alamat</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold h-24 resize-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-accent-gold transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Memproses...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center animate-scale-in">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Hapus Pemasok?</h3>
                        <p className="text-gray-400 mb-8 text-sm">Data riwayat pasokan mungkin masih tersimpan di catatan lain (jika ada), namun kontak ini akan dihapus.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold">Batal</button>
                            <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50">
                                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
