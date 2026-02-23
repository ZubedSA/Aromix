"use client";

import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download
} from 'lucide-react';

export default function AdminStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-gray-400">Menganalisis data global...</div>;

    return (
        <div className="p-6 md:p-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold premium-gradient-text">Statistik Global</h1>
                    <p className="text-gray-400 mt-1">Laporan performa dan tren pertumbuhan ekosistem Aromix.</p>
                </div>
                <div className="flex gap-3">
                    <button className="glass-panel px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:border-accent-gold/50 transition-all">
                        <Calendar size={16} />
                        <span>30 Hari Terakhir</span>
                    </button>
                    <button className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-accent-gold transition-all">
                        <Download size={16} />
                        <span>Ekspor Laporan</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trends */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8 rounded-3xl h-96 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-accent-emerald" />
                                Pertumbuhan Pendapatan
                            </h2>
                            <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span className="text-accent-gold">Omzet</span>
                                <span>Laba</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-border rounded-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            [Visualisasi Tren Keuangan Global Akan Muncul Di Sini]
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MiniCard
                            title="Rata-rata Pendapatan / Toko"
                            value={`Rp ${(stats.totalRevenue / (stats.totalStores || 1)).toLocaleString('id-ID')}`}
                            trend="+12.4%"
                            up={true}
                        />
                        <MiniCard
                            title="Retensi Pelanggan Global"
                            value="68.5%"
                            trend="-2.1%"
                            up={false}
                        />
                    </div>
                </div>

                {/* Growth Stats */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold">Mitra Teraktif</h3>
                    <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-border">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-surface/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold">
                                        {i}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Outlet Wangi #{i}</div>
                                        <div className="text-[10px] text-gray-500">1.2k Transaksi</div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-accent-emerald">+ Rp {(2500000 / i).toLocaleString('id-ID')}</div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sistem Health</h3>
                        <div className="space-y-3">
                            <HealthRow label="API Response" value="124ms" status="good" />
                            <HealthRow label="Database Connection" value="99.9%" status="good" />
                            <HealthRow label="Active Workers" value="12/12" status="good" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniCard({ title, value, trend, up }: any) {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
            <div className="flex justify-between items-end">
                <h4 className="text-xl font-bold">{value}</h4>
                <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-accent-emerald' : 'text-red-400'}`}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            </div>
        </div>
    );
}

function HealthRow({ label, value, status }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{value}</span>
                <div className={`w-2 h-2 rounded-full ${status === 'good' ? 'bg-accent-emerald' : 'bg-red-400'}`} />
            </div>
        </div>
    );
}
