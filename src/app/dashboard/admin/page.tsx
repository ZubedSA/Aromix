"use client";

import React, { useEffect, useState } from 'react';
import {
    Activity,
    Store,
    Users,
    CreditCard,
    TrendingUp,
    ShieldCheck,
    Calendar,
    Search,
    ExternalLink,
    Activity as ActivityIcon,
    Database
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, storesRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/stores')
            ]);

            const statsData = await statsRes.json();
            const storesData = await storesRes.json();

            setStats(statsData);
            setStores(storesData);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-gray-400">Memuat modul pengelola global...</div>;

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-10">
            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden block">
                {/* Mobile Header */}
                <header className="px-6 pt-10 pb-20 bg-gradient-to-b from-accent-gold/10 to-transparent flex justify-between items-center">
                    <div>
                        <span className="bg-accent-gold/20 text-accent-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border border-accent-gold/30">
                            Super Admin
                        </span>
                        <h1 className="text-2xl font-black italic premium-gradient-text tracking-tighter uppercase mt-1">AROMIX Global</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchAdminData} className="p-2 bg-surface border border-border rounded-xl">
                            <Activity size={20} className="text-gray-400" />
                        </button>
                    </div>
                </header>

                <div className="px-6 -mt-12 space-y-6">
                    {/* Global Summary Card */}
                    <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-2xl border-white/5 bg-surface/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-accent-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Status Sistem Global</span>
                            </div>
                            <span className="text-[10px] text-accent-emerald animate-pulse flex items-center gap-1">
                                <div className="w-1 h-1 bg-accent-emerald rounded-full" />
                                LIVE
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.totalStores || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Mitra</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.totalUsers || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Pengguna</div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Action Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/admin/users" className="glass-panel p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-accent-gold/50 transition-all group">
                            <div className="w-12 h-12 bg-accent-gold/10 rounded-2xl flex items-center justify-center border border-accent-gold/20 group-hover:bg-accent-gold group-hover:text-black transition-all">
                                <Users size={24} />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-sm">Manajemen Owner</div>
                                <div className="text-[10px] text-gray-500">Persetujuan Akun</div>
                            </div>
                        </Link>
                        <Link href="/dashboard/admin/stores" className="glass-panel p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-accent-gold/50 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Store size={24} />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-sm">Data Toko</div>
                                <div className="text-[10px] text-gray-500">Monitoring Mitra</div>
                            </div>
                        </Link>
                        <Link href="/dashboard/admin/financial" className="glass-panel p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-accent-gold/50 transition-all group">
                            <div className="w-12 h-12 bg-accent-emerald/10 rounded-2xl flex items-center justify-center border border-accent-emerald/20 group-hover:bg-accent-emerald group-hover:text-white transition-all">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-sm">Keuangan Global</div>
                                <div className="text-[10px] text-gray-500">Monitoring GMV</div>
                            </div>
                        </Link>
                        <Link href="/dashboard/admin/backup" className="glass-panel p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-accent-gold/50 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Database size={24} />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-sm">Backup & Restore</div>
                                <div className="text-[10px] text-gray-500">Ekspor/Impor Data</div>
                            </div>
                        </Link>
                    </div>

                    {/* Section: Mitra Terkini */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Mitra Terkini</h2>
                            <Link href="/dashboard/admin/stores" className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">Lihat Semua</Link>
                        </div>
                        <div className="space-y-3">
                            {stores.slice(0, 3).map((store) => (
                                <div key={store.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center border border-border">
                                            <Store size={18} className="text-accent-gold" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{store.name}</div>
                                            <div className="text-[10px] text-gray-500 italic">{store.subscription?.planName || 'Silver'} Plan</div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase ${store.subscription?.status === 'ACTIVE' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {store.subscription?.status || 'OFF'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:block">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-accent-gold/20 text-accent-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border border-accent-gold/30">
                                Super Admin
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold premium-gradient-text">Pusat Kendali Sistem</h1>
                        <p className="text-gray-400">Monitoring operasional global dan manajemen mitra aromix.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchAdminData} className="glass-panel px-4 py-2 rounded-full hover:border-accent-gold/50 transition-all flex items-center gap-2 text-sm">
                            <Activity size={16} />
                            <span>Refresh Data</span>
                        </button>
                    </div>
                </header>

                {/* Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <AdminStatCard
                        title="Total Toko Terdaftar"
                        value={stats?.totalStores || 0}
                        icon={<Store className="text-accent-gold" />}
                        description="Ekosistem Aromix"
                    />
                    <AdminStatCard
                        title="Total Pengguna"
                        value={stats?.totalUsers || 0}
                        icon={<Users className="text-blue-400" />}
                        description="Seluruh Role"
                    />
                    <AdminStatCard
                        title="Volume Transaksi"
                        value={stats?.totalTransactions || 0}
                        icon={<Activity className="text-purple-400" />}
                        description="Global Counter"
                    />
                    <AdminStatCard
                        title="Total GMV"
                        value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
                        icon={<TrendingUp className="text-accent-emerald" />}
                        description="Pendapatan Seluruh Toko"
                    />
                </div>

                {/* Section: Store Management */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck size={22} className="text-accent-gold" />
                            Manajemen Mitra & Langganan
                        </h2>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama toko atau ID..."
                                className="w-full bg-surface border border-border rounded-xl py-2 pl-11 pr-4 focus:border-accent-gold outline-none transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background/50 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Informasi Toko</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status & Paket</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Masa Berlaku</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aktivitas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredStores.map((store) => (
                                        <tr key={store.id} className="hover:bg-surface/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-200">{store.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{store.id}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${store.subscription?.status === 'ACTIVE'
                                                        ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        }`}>
                                                        {store.subscription?.status || 'UNSET'}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-400">
                                                        {store.subscription?.planName || 'Silver'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Calendar size={14} />
                                                    {store.subscription?.endDate
                                                        ? new Date(store.subscription.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        : 'Belum diatur'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="text-xs text-gray-500">
                                                        {store._count.transactions} Trx | {store._count.users} Users
                                                    </div>
                                                    <button className="text-accent-gold text-xs hover:underline flex items-center gap-1">
                                                        Kelola Langganan <ExternalLink size={10} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ title, value, icon, description }: any) {
    return (
        <div className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-background rounded-xl border border-border">
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
}
