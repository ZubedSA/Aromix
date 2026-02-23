"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Users, Shield, Trash2, Mail, Calendar, X, AlertCircle } from 'lucide-react';

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        const res = await fetch('/api/staff');
        const data = await res.json();
        setStaff(data);
    };

    const handleOpenDelete = (user: any) => {
        setSelectedStaff(user);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedStaff) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/staff?id=${selectedStaff.id}`, { method: 'DELETE' });
            if (res.ok) {
                setIsDeleteModalOpen(false);
                fetchStaff();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormData({ name: '', email: '', password: '' });
                setIsModalOpen(false);
                fetchStaff();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-10">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold premium-gradient-text">Kelola Kasir</h1>
                    <p className="text-gray-400 mt-1">Manajemen akun kasir untuk toko Anda.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-foreground text-background px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-gold transition-all"
                >
                    <Plus size={20} />
                    Tambah Kasir
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((user) => (
                    <div key={user.id} className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                <Shield className="text-accent-gold" />
                            </div>
                            <button
                                onClick={() => handleOpenDelete(user)}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold mb-4">{user.name}</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail size={14} className="text-accent-gold" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar size={14} className="text-accent-gold" />
                                <span>Bergabung: {new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Akses</span>
                            <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-xs rounded-lg font-bold">KASIR</span>
                        </div>
                    </div>
                ))}
                {staff.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        Belum ada akun kasir yang terdaftar.
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
                            <h2 className="text-xl font-bold">Tambah Akun Kasir Baru</h2>
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
                                    placeholder="Nama Kasir"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="kasir@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimal 6 karakter"
                                />
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
                                    {isSubmitting ? 'Memproses...' : 'Buat Akun'}
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
                        <h3 className="text-xl font-bold mb-2">Hapus Akun Kasir?</h3>
                        <p className="text-gray-400 mb-8 text-sm">Kasir ini tidak akan bisa login lagi ke sistem. Data transaksi yang sudah ada akan tetap tersimpan.</p>
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
