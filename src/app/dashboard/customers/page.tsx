"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Phone, Mail, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : []);
    };

    const handleOpenAdd = () => {
        setSelectedCustomer(null);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setSelectedCustomer(item);
        setFormData({ name: item.name, phone: item.phone || '', email: item.email || '', notes: item.notes || '' });
        setIsModalOpen(true);
    };

    const handleOpenDelete = (item: any) => {
        setSelectedCustomer(item);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = selectedCustomer ? `/api/customers/${selectedCustomer.id}` : '/api/customers';
            const method = selectedCustomer ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCustomer) return;
        setIsSubmitting(true);
        try {
            await fetch(`/api/customers/${selectedCustomer.id}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            fetchCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    return (
        <div className="p-6 md:p-10">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold premium-gradient-text">Pelanggan</h1>
                    <p className="text-gray-400 mt-1">Kelola data pelanggan tetap dan riwayat mereka.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-foreground text-background px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-gold transition-all"
                >
                    <Plus size={20} />
                    Tambah Pelanggan
                </button>
            </header>

            <div className="mb-8 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atau telepon..."
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                <Users className="text-accent-gold" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEdit(customer)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleOpenDelete(customer)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-4">{customer.name}</h3>

                        <div className="space-y-3 mb-6">
                            {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Phone size={14} className="text-accent-emerald" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Mail size={14} className="text-blue-400" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Total Belanja</span>
                            <span className="text-sm font-bold text-accent-gold">
                                {customer._count?.transactions || 0} Kali
                            </span>
                        </div>
                    </div>
                ))}
                {filteredCustomers.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        {customers.length === 0 ? "Belum ada pelanggan." : "Pelanggan tidak ditemukan."}
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
                            <h2 className="text-xl font-bold">{selectedCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Telepon</label>
                                    <input
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Catatan</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold h-24 resize-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
                        <h3 className="text-xl font-bold mb-2">Hapus Pelanggan?</h3>
                        <p className="text-gray-400 mb-8 text-sm">Data riwayat transaksi pelanggan ini akan tetap ada, namun nama pelanggan tidak lagi terhubung.</p>
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
