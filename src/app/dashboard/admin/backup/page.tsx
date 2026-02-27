"use client";

import React, { useState } from 'react';
import {
    Download,
    Upload,
    AlertTriangle,
    CheckCircle2,
    RefreshCcw,
    ShieldAlert,
    Database,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function BackupPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

    const handleExport = async () => {
        setIsExporting(true);
        setStatus({ type: 'idle', message: '' });
        try {
            const res = await fetch('/api/admin/backup');
            if (!res.ok) throw new Error('Export gagal');

            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `AROMIX_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setStatus({ type: 'success', message: 'Backup data berhasil diunduh!' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('PERINGATAN: Seluruh data saat ini akan DIHAPUS dan diganti dengan data dari file backup. Lanjutkan?')) {
            e.target.value = '';
            return;
        }

        setIsImporting(true);
        setStatus({ type: 'idle', message: '' });

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = event.target?.result;
                    const data = JSON.parse(content as string);

                    const res = await fetch('/api/admin/backup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.error || 'Restore gagal');
                    }

                    setStatus({ type: 'success', message: 'Sistem berhasil dipulihkan dari backup!' });
                } catch (err: any) {
                    setStatus({ type: 'error', message: err.message });
                } finally {
                    setIsImporting(false);
                    e.target.value = '';
                }
            };
            reader.readAsText(file);
        } catch (err: any) {
            setStatus({ type: 'error', message: 'Gagal membaca file' });
            setIsImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <Link href="/dashboard/admin" className="flex items-center gap-2 text-gray-500 hover:text-accent-gold transition-colors mb-4 text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} />
                        Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold premium-gradient-text tracking-tight">MANAJEMEN DATABASE</h1>
                    <p className="text-gray-400">Ekspor seluruh data sistem atau pulihkan dari riwayat backup.</p>
                </div>
                <div className="hidden md:block">
                    <div className="w-12 h-12 bg-accent-gold/10 rounded-2xl flex items-center justify-center border border-accent-gold/20">
                        <Database className="text-accent-gold" size={24} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* EXPORT SECTION */}
                <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <Download size={120} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accent-emerald/10 rounded-2xl flex items-center justify-center border border-accent-emerald/20 text-accent-emerald">
                            <Download size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ekspor Seluruh Data</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Download JSON Backup</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed">
                        Fitur ini akan mengumpulkan seluruh data dari semua toko, produk, transaksi, dan pelanggan ke dalam satu file `.json`. Sangat disarankan dilakukan sebelum melakukan update besar.
                    </p>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full bg-surface border border-border hover:border-accent-emerald/50 rounded-2xl py-4 flex items-center justify-center gap-3 font-bold transition-all hover:bg-accent-emerald/5 text-accent-emerald disabled:opacity-50"
                    >
                        {isExporting ? <RefreshCcw className="animate-spin" size={20} /> : <Download size={20} />}
                        {isExporting ? 'Mengekspor Data...' : 'Unduh Backup Sekarang'}
                    </button>
                </div>

                {/* RESTORE SECTION */}
                <div className="glass-panel p-8 rounded-3xl space-y-6 relative border-red-500/10 hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500">
                            <Upload size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-500">Pulihkan Sistem</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Restore dari JSON</p>
                        </div>
                    </div>

                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
                        <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-500/80 leading-tight italic">
                            <b>PERINGATAN KRITIS:</b> Proses restore akan menghapus SELURUH data di database saat ini dan menggantinya dengan isi file backup. Gunakan hanya jika benar-benar diperlukan.
                        </p>
                    </div>

                    <div className="relative group/upload">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={isImporting}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-red-500/10 border-2 border-dashed border-red-500/20 group-hover/upload:border-red-500/50 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 transition-all">
                            <Upload size={32} className="text-red-500/50 group-hover/upload:text-red-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-red-500/70 group-hover/upload:text-red-500 animate-pulse">
                                {isImporting ? 'Sedang Memulihkan...' : 'Klik atau Drag File Backup'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATUS NOTIFICATION */}
            {status.type !== 'idle' && (
                <div className={`mt-8 p-5 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 ${status.type === 'success'
                        ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                    <div className="flex-1">
                        <p className="font-bold text-sm uppercase tracking-widest leading-none mb-1">
                            {status.type === 'success' ? 'Berhasil' : 'Galat Sistem'}
                        </p>
                        <p className="text-xs opacity-80">{status.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
