"use client";

import React, { useEffect, useState } from 'react';
import {
    History as HistoryIcon,
    Search,
    FileText,
    Calendar,
    ArrowUpRight,
    Printer,
    Eye
} from 'lucide-react';

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/transactions/history')
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            });
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-gray-400">Memuat riwayat transaksi...</div>;

    return (
        <div className="p-6 md:p-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold premium-gradient-text">Riwayat Transaksi</h1>
                    <p className="text-gray-400 mt-1">Daftar seluruh transaksi yang telah dilakukan di toko Anda.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari No. Invoice atau Kasir..."
                            className="w-full bg-surface border border-border rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-accent-gold transition-all text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">No. Invoice</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Waktu</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kasir</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Item</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Bayar</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-surface/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-bold text-accent-gold">
                                        {tx.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar size={14} />
                                            {new Date(tx.createdAt).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {tx.cashierName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {tx.items?.length || 0} Item
                                    </td>
                                    <td className="px-6 py-4 font-bold text-accent-emerald">
                                        Rp {parseFloat(tx.totalAmount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-gray-500 hover:text-accent-gold transition-colors">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <HistoryIcon size={40} className="opacity-20" />
                                            <p>Tidak ada transaksi ditemukan.</p>
                                        </div>
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
