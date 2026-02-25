"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, ShoppingBag, Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            setReportData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-gray-400">Menganalisis data...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text">Laporan Analitik</h1>
                    <p className="text-gray-400 mt-1 break-words">Pantau performa penjualan dan produk terlaris Anda.</p>
                </div>
                <button
                    className="bg-surface border border-border px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all"
                >
                    <Download size={20} />
                    Ekspor Laporan
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard
                    title="Total Omzet (7 Hari)"
                    value={`Rp ${reportData?.dailySales?.reduce((acc: number, curr: any) => acc + parseFloat(curr._sum.totalAmount), 0).toLocaleString('id-ID') || 0}`}
                    icon={<TrendingUp className="text-accent-emerald" />}
                />
                <SummaryCard
                    title="Produk Terjual"
                    value={reportData?.topProducts?.reduce((acc: number, curr: any) => acc + curr._sum.quantity, 0) || 0}
                    icon={<Package className="text-accent-gold" />}
                />
                <SummaryCard
                    title="Rata-rata Transaksi"
                    value={`Rp ${(reportData?.dailySales?.length > 0 ? (reportData?.dailySales?.reduce((acc: number, curr: any) => acc + parseFloat(curr._sum.totalAmount), 0) / reportData?.dailySales?.length) : 0).toLocaleString('id-ID')}`}
                    icon={<BarChart3 className="text-blue-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-accent-gold" />
                        Tren Penjualan 7 Hari Terakhir
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {reportData?.dailySales?.map((day: any, idx: number) => {
                            const max = Math.max(...reportData.dailySales.map((d: any) => parseFloat(d._sum.totalAmount)));
                            const height = (parseFloat(day._sum.totalAmount) / max) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-accent-gold/20 rounded-t-lg group-hover:bg-accent-gold/40 transition-all relative" style={{ height: `${height}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Rp {parseFloat(day._sum.totalAmount).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase">{new Date(day.createdAt).toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                        {(!reportData?.dailySales || reportData.dailySales.length === 0) && (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 italic">Belum ada data penjualan 7 hari terakhir</div>
                        )}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-accent-gold" />
                        5 Produk Terlaris
                    </h3>
                    <div className="space-y-4">
                        {reportData?.topProducts?.map((product: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-surface/50 rounded-xl border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-accent-gold border border-border">{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="font-bold">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product._sum.quantity} unit terjual</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-accent-emerald">Rp {parseFloat(product._sum.subtotal).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ))}
                        {(!reportData?.topProducts || reportData.topProducts.length === 0) && (
                            <div className="py-10 text-center text-gray-600 italic">Belum ada data produk terjual</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon }: any) {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-background p-2 rounded-xl border border-border">{icon}</div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
