"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Store,
    Calendar,
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    Key,
    Clock,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Mail
} from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Action Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowDoubleClick = (user: any) => {
        setSelectedUser(user);
        setActionMessage({ type: '', text: '' });
        setIsActionModalOpen(true);
    };

    const handleToggleApproval = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: !selectedUser.isApproved })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedUser({ ...selectedUser, isApproved: updated.isApproved });
                setActionMessage({ type: 'success', text: `Status berhasil diubah menjadi ${updated.isApproved ? 'Aktif' : 'Non-Aktif'}` });
                fetchUsers();
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Gagal mengubah status' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleExtendActive = async (days: number) => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days })
            });
            if (res.ok) {
                const updatedSub = await res.json();
                // Update local selection to reflect new date
                const updatedUser = { ...selectedUser };
                updatedUser.store.subscription = updatedSub;
                setSelectedUser(updatedUser);
                setActionMessage({ type: 'success', text: `Masa aktif berhasil diperpanjang ${days} hari` });
                fetchUsers();
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Gagal memperpanjang masa aktif' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        const newPass = "aromix123"; // Default temp password
        if (!confirm(`Reset password untuk ${selectedUser.name} menjadi "${newPass}"?`)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: newPass })
            });
            if (res.ok) {
                setActionMessage({ type: 'success', text: `Password berhasil direset menjadi: ${newPass}` });
            }
        } catch (error) {
            setActionMessage({ type: 'error', text: 'Gagal mereset password' });
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.store?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (user: any) => {
        const isExpired = user.store?.subscription?.endDate && new Date(user.store.subscription.endDate) < new Date();

        if (!user.isApproved) return <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-xs rounded-lg font-bold">MENUNGGU</span>;
        if (isExpired) return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded-lg font-bold">EXPIRED</span>;
        return <span className="px-2 py-0.5 bg-accent-emerald/10 text-accent-emerald text-xs rounded-lg font-bold">AKTIF</span>;
    };

    return (
        <div className="p-6 md:p-10 text-white min-h-screen">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold premium-gradient-text">Manajemen Owner</h1>
                    <p className="text-gray-400 mt-1">Daftar toko dan owner yang menggunakan sistem AROMIX.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari owner, email, atau toko..."
                        className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-accent-gold" />
                    <p>Memuat data pengguna...</p>
                </div>
            ) : (
                <div className="glass-panel rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface/50 border-b border-border">
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Nama Owner</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Toko / Brand</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Masa Aktif</th>
                                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        onDoubleClick={() => handleRowDoubleClick(user)}
                                        className="hover:bg-accent-gold/5 transition-all cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center border border-border group-hover:border-accent-gold/50 transition-all font-bold text-accent-gold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Store size={14} className="text-accent-gold" />
                                                <span className="font-medium">{user.store?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(user)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={14} className="text-gray-500" />
                                                <span>
                                                    {user.store?.subscription?.endDate
                                                        ? new Date(user.store.subscription.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRowDoubleClick(user)}
                                                className="p-2 text-gray-500 hover:text-accent-gold transition-colors inline-block"
                                                title="Klik 2x baris untuk aksi"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-500">
                                            Tidak ada pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 italic">
                <AlertTriangle size={14} />
                <span>Tip: Klik 2x pada baris tabel untuk membuka menu aksi cepat (Aktivasi, Perpanjang Masa Aktif, Reset Password).</span>
            </div>

            {/* Action Modal */}
            {isActionModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in border border-white/10">
                        {/* Header Modal */}
                        <div className="p-8 border-b border-border flex justify-between items-start bg-surface/30">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-accent-gold/10 rounded-2xl flex items-center justify-center border border-accent-gold/20">
                                    <Users className="text-accent-gold" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Aksi Pengguna</h2>
                                    <p className="text-gray-400 text-sm">Mengelola owner: <span className="text-white font-medium">{selectedUser.name}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsActionModalOpen(false)}
                                className="p-2 bg-surface hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Modal */}
                        <div className="p-8 space-y-8">
                            {/* Message Alert */}
                            {actionMessage.text && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${actionMessage.type === 'success' ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                    }`}>
                                    {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    <span className="text-sm font-medium">{actionMessage.text}</span>
                                </div>
                            )}

                            {/* Section 1: Access Control */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Kontrol Akses</h3>
                                <button
                                    onClick={handleToggleApproval}
                                    disabled={actionLoading}
                                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group ${selectedUser.isApproved
                                            ? "bg-red-500/5 border-red-500/20 hover:bg-red-500 text-white"
                                            : "bg-accent-emerald/5 border-accent-emerald/20 hover:bg-accent-emerald text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {selectedUser.isApproved ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                                        <div className="text-left">
                                            <div className="font-bold">{selectedUser.isApproved ? "Non-Aktifkan Akun" : "Aktifkan / Setujui Akun"}</div>
                                            <div className={`text-xs ${selectedUser.isApproved ? "text-red-400 group-hover:text-red-100" : "text-accent-emerald group-hover:text-emerald-100"}`}>
                                                {selectedUser.isApproved ? "Mencabut akses owner ke sistem" : "Memberikan akses penuh ke dashboard"}
                                            </div>
                                        </div>
                                    </div>
                                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Ubah Status</span>}
                                </button>
                            </div>

                            {/* Section 2: Subscription */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Perpanjang Masa Aktif</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[30, 90, 365].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => handleExtendActive(days)}
                                            disabled={actionLoading}
                                            className="p-4 bg-surface border border-border rounded-2xl hover:border-accent-gold hover:text-accent-gold transition-all text-center group"
                                        >
                                            <Clock className="mx-auto mb-2 text-gray-500 group-hover:text-accent-gold" size={18} />
                                            <div className="text-sm font-bold">+{days} Hari</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{days === 365 ? '1 Tahun' : `${days / 30} Bulan`}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Danger Zone */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Pusat Keamanan</h3>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={actionLoading}
                                    className="w-full p-4 bg-surface border border-border rounded-2xl flex items-center justify-between hover:border-accent-gold transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Key className="text-gray-500 group-hover:text-accent-gold" size={20} />
                                        <div className="text-left">
                                            <div className="font-bold">Reset Password</div>
                                            <div className="text-xs text-gray-500">Ubah password menjadi <span className="text-accent-gold">aromix123</span></div>
                                        </div>
                                    </div>
                                    <Loader2 className={`animate-spin ${actionLoading ? 'opacity-100' : 'opacity-0'}`} size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-6 bg-surface/50 border-t border-border flex justify-end">
                            <button
                                onClick={() => setIsActionModalOpen(false)}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
