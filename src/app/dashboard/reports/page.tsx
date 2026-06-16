"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { BarChart3, TrendingUp, TrendingDown, Package, ShoppingBag, Calendar, Download, FileText } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReportsPage() {
    const getPastDateString = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [startDate, setStartDate] = useState(getPastDateString(6));
    const [endDate, setEndDate] = useState(getPastDateString(0));

    const { data: reportData, isLoading, isValidating } = useSWR(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`,
        fetcher
    );

    const loading = isLoading;
    const refreshing = isValidating;

    const exportToCSV = () => {
        const transactions = reportData?.transactions || [];
        if (!transactions.length) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Tanggal,No. Invoice,Pelanggan,Kasir,Metode Pembayaran,Item Terjual,Omzet (Rp),Total HPP (Rp),Laba Bersih (Rp),Margin (%)\r\n";
        
        transactions.forEach((tx: any) => {
            const dateStr = new Date(tx.createdAt).toLocaleString('id-ID');
            const invoice = tx.invoiceNumber;
            const customer = tx.customer?.name || "Umum";
            const cashier = tx.cashierName;
            const paymentMethod = tx.paymentMethod || "TUNAI";
            
            const itemsSummary = tx.items.map((item: any) => {
                const name = item.product?.name || item.ingredient?.name || "Item";
                return `${name} (${item.quantity})`;
            }).join(" | ");
            
            const omzet = parseFloat(tx.totalAmount);
            
            const hpp = tx.items.reduce((sum: number, item: any) => {
                const itemPurchasePrice = parseFloat(item.purchasePrice || 0) > 0 
                    ? parseFloat(item.purchasePrice) 
                    : (parseFloat(item.product?.purchasePrice || 0) || parseFloat(item.ingredient?.purchasePrice || 0));
                return sum + (itemPurchasePrice * item.quantity);
            }, 0);
            
            const laba = omzet - hpp;
            const margin = omzet > 0 ? ((laba / omzet) * 100).toFixed(2) : "0.00";
            
            const row = [
                `"${dateStr}"`,
                `"${invoice}"`,
                `"${customer}"`,
                `"${cashier}"`,
                `"${paymentMethod}"`,
                `"${itemsSummary}"`,
                omzet,
                hpp,
                laba,
                `"${margin}%"`
            ].join(",");
            
            csvContent += row + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Aromix_${startDate}_ke_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-gray-400">Menganalisis data...</div>;

    const transactions = reportData?.transactions || [];

    // Sum total omzet from transactions
    const totalOmzet = transactions.reduce((acc: number, tx: any) => acc + parseFloat(tx.totalAmount), 0);

    // Sum total laba: sum of (subtotal - purchasePrice * quantity)
    const totalLaba = transactions.reduce((acc: number, tx: any) => {
        const txProfit = tx.items.reduce((itemAcc: number, item: any) => {
            const itemPurchasePrice = parseFloat(item.purchasePrice || 0) > 0 
                ? parseFloat(item.purchasePrice) 
                : (parseFloat(item.product?.purchasePrice || 0) || parseFloat(item.ingredient?.purchasePrice || 0));
            const cost = itemPurchasePrice * item.quantity;
            const profit = parseFloat(item.subtotal) - cost;
            return itemAcc + profit;
        }, 0);
        return acc + txProfit;
    }, 0);

    // Sum total products sold
    const totalProductsSold = transactions.reduce((acc: number, tx: any) => {
        return acc + tx.items.reduce((itemAcc: number, item: any) => itemAcc + item.quantity, 0);
    }, 0);

    // Transaction average
    const totalTransactions = transactions.length;
    const avgTransactionValue = totalTransactions > 0 ? (totalOmzet / totalTransactions) : 0;

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text">Laporan Analitik</h1>
                    <p className="text-gray-400 mt-1 break-words">Pantau performa penjualan dan produk terlaris Anda.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-3 bg-surface/40 p-2 rounded-2xl border border-border/60">
                        <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-xl border border-border">
                            <Calendar size={16} className="text-accent-gold" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-sm text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <span className="text-gray-500 font-bold text-xs uppercase">s/d</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-xl border border-border">
                            <Calendar size={16} className="text-accent-gold" />
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-sm text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                                min={startDate}
                            />
                        </div>
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={transactions.length === 0}
                        className="bg-surface border border-border px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        Ekspor Laporan
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SummaryCard
                    title="Total Omzet"
                    value={`Rp ${totalOmzet.toLocaleString('id-ID')}`}
                    icon={<TrendingUp className="text-accent-emerald" />}
                />
                <SummaryCard
                    title="Total Laba"
                    value={`Rp ${totalLaba.toLocaleString('id-ID')}`}
                    icon={<TrendingUp className="text-accent-emerald" />}
                />
                <SummaryCard
                    title="Produk Terjual"
                    value={totalProductsSold}
                    icon={<Package className="text-accent-gold" />}
                />
                <SummaryCard
                    title="Rata-rata Transaksi"
                    value={`Rp ${avgTransactionValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
                    icon={<BarChart3 className="text-blue-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-accent-gold" />
                        Tren Penjualan Harian
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 overflow-x-auto pb-2 min-w-full">
                        {reportData?.dailySales?.map((day: any, idx: number) => {
                            const salesValues = reportData?.dailySales?.map((d: any) => parseFloat(d._sum.totalAmount || 0)) || [];
                            const max = salesValues.length > 0 ? Math.max(...salesValues) : 0;
                            const height = max > 0 ? (parseFloat(day._sum.totalAmount) / max) * 100 : 0;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group min-w-[40px] h-full">
                                    <div className="flex-1 w-full flex items-end relative">
                                        <div 
                                            className="w-full bg-accent-gold/20 rounded-t-lg group-hover:bg-accent-gold/40 transition-all relative" 
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Rp {parseFloat(day._sum.totalAmount).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase">{new Date(day.createdAt).toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                        {(!reportData?.dailySales || reportData.dailySales.length === 0) && (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 italic">Belum ada data penjualan pada rentang tanggal ini</div>
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
                            <div className="py-10 text-center text-gray-600 italic">Belum ada data produk terjual pada rentang tanggal ini</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl mt-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <FileText size={20} className="text-accent-gold" />
                            Rincian Transaksi & Margin Keuntungan
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Daftar lengkap transaksi dalam rentang tanggal yang dipilih.</p>
                    </div>
                    {refreshing && (
                        <span className="text-xs text-accent-gold animate-pulse">Memperbarui...</span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-border/80 text-gray-400">
                                <th className="pb-3 pr-4 font-semibold min-w-[140px]">Tanggal & Waktu</th>
                                <th className="pb-3 pr-4 font-semibold min-w-[180px]">No. Invoice</th>
                                <th className="pb-3 pr-4 font-semibold min-w-[100px]">Pelanggan</th>
                                <th className="pb-3 pr-4 font-semibold min-w-[100px]">Metode</th>
                                <th className="pb-3 pr-4 font-semibold min-w-[200px]">Detail Barang</th>
                                <th className="pb-3 pr-4 font-semibold text-right min-w-[100px]">Omzet</th>
                                <th className="pb-3 pr-4 font-semibold text-right min-w-[100px]">Total HPP</th>
                                <th className="pb-3 pr-4 font-semibold text-right min-w-[110px]">Laba Bersih</th>
                                <th className="pb-3 font-semibold text-right min-w-[80px]">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {transactions.map((tx: any) => {
                                const omzet = parseFloat(tx.totalAmount);
                                const hpp = tx.items.reduce((sum: number, item: any) => {
                                    const itemPurchasePrice = parseFloat(item.purchasePrice || 0) > 0 
                                        ? parseFloat(item.purchasePrice) 
                                        : (parseFloat(item.product?.purchasePrice || 0) || parseFloat(item.ingredient?.purchasePrice || 0));
                                    return sum + (itemPurchasePrice * item.quantity);
                                }, 0);
                                const laba = omzet - hpp;
                                const margin = omzet > 0 ? (laba / omzet) * 100 : 0;
                                
                                return (
                                    <tr key={tx.id} className="hover:bg-surface/30 transition-all group">
                                        <td className="py-4 pr-4 text-gray-300 whitespace-nowrap">
                                            {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}, {new Date(tx.createdAt).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-4 pr-4 font-mono font-medium text-accent-gold whitespace-nowrap">{tx.invoiceNumber}</td>
                                        <td className="py-4 pr-4 text-gray-300 whitespace-nowrap">{tx.customer?.name || "Umum"}</td>
                                        <td className="py-4 pr-4 text-gray-300 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                tx.paymentMethod === 'TUNAI' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                tx.paymentMethod === 'TRANSFER' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                tx.paymentMethod === 'QRIS' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                                'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            }`}>
                                                {tx.paymentMethod || 'TUNAI'}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-xs text-gray-400 whitespace-normal break-words max-w-[220px]">
                                            {tx.items.map((item: any) => {
                                                const name = item.product?.name || item.ingredient?.name || "Item";
                                                return `${name} (x${item.quantity})`;
                                            }).join(", ")}
                                        </td>
                                        <td className="py-4 pr-4 text-right font-medium text-gray-200 whitespace-nowrap">
                                            Rp {omzet.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-4 pr-4 text-right font-medium text-gray-400 whitespace-nowrap">
                                            Rp {hpp.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-4 pr-4 text-right font-bold whitespace-nowrap ${laba >= 0 ? 'text-accent-emerald' : 'text-rose-400'}`}>
                                            Rp {laba.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-4 text-right font-semibold whitespace-nowrap ${laba >= 0 ? 'text-accent-emerald/80' : 'text-rose-400/80'}`}>
                                            {margin.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-10 text-center text-gray-500 italic">
                                        Tidak ada transaksi dalam periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
