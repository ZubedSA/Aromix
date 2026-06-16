"use client";

import React, { useEffect, useState } from 'react';
import { Search, History, Printer, BarChart3, Calendar, Eye, MessageCircle, X } from 'lucide-react';

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Detail Modal States
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // WhatsApp Prompt States
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [promptTx, setPromptTx] = useState<any>(null);
    const [promptPhone, setPromptPhone] = useState('');

    const [receiptSettings, setReceiptSettings] = useState<any>({
        showLogo: true,
        headerLine1: 'AROMIX PARFUMERY',
        headerLine2: 'Racikan Parfum Mewah & Tahan Lama',
        phone: '0812-3456-7890',
        paperSize: '58mm',
        showCashier: true,
        showPaymentMethod: true,
        footerLine1: 'Terima Kasih Atas Kunjungan Anda!',
        footerLine2: 'Barang yang sudah diracik tidak dapat dikembalikan.'
    });

    const [waSettings, setWaSettings] = useState<any>({
        provider: 'Fonnte (Rekomendasi)',
        gatewayNumber: '+62 812-3456-7890',
        apiToken: 'AromixGatewayTokenSample2026',
        isConnected: true,
        sendReceipt: true,
        dailyReport: false,
        lowStockAlert: true,
        template: 'Halo {NamaPelanggan},\n\nTerima kasih telah berbelanja di {NamaToko}.\nNo. Invoice: {NoInvoice}\nTotal Belanja: {TotalBelanja}\n\nSemoga hari Anda wangi & menyenangkan!'
    });

    useEffect(() => {
        fetchTransactions();

        const savedReceipt = localStorage.getItem('aromix_receipt_settings');
        if (savedReceipt) {
            try { setReceiptSettings(JSON.parse(savedReceipt)); } catch (e) {}
        }
        const savedWa = localStorage.getItem('aromix_wa_settings');
        if (savedWa) {
            try { setWaSettings(JSON.parse(savedWa)); } catch (e) {}
        }
    }, []);

    const fetchTransactions = () => {
        setLoading(true);
        fetch('/api/transactions/history')
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const filteredTransactions = transactions.filter(t =>
        t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase())
    );

    const handleViewDetail = (tx: any) => {
        setSelectedTx(tx);
        setIsDetailOpen(true);
    };

    const handlePrint = (tx: any) => {
        if (!tx) return;
        const paperWidth = receiptSettings.paperSize === '80mm' ? '350px' : '260px';
        const printWindow = window.open('', '_blank', 'width=450,height=600');
        if (!printWindow) return;

        const itemsHTML = tx.items.map((item: any) => {
            const name = item.product?.name || item.ingredient?.name || 'Item';
            return `
                <tr>
                    <td style="padding: 4px 0; max-width: 140px; word-break: break-all;">${name} (x${item.quantity})</td>
                    <td style="text-align: right; padding: 4px 0; vertical-align: top; white-space: nowrap;">Rp ${parseFloat(item.price).toLocaleString('id-ID')}</td>
                </tr>
            `;
        }).join('');

        const totalAmountStr = parseFloat(tx.totalAmount).toLocaleString('id-ID');

        printWindow.document.write(`
            <html>
            <head>
                <title>Nota ${tx.invoiceNumber}</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 11px;
                        color: #000;
                        margin: 5px;
                        width: ${paperWidth};
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .header { font-weight: bold; margin-bottom: 12px; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    table { width: 100%; border-collapse: collapse; }
                </style>
            </head>
            <body>
                <div class="text-center header">
                    ${receiptSettings.showLogo ? '<div style="font-size: 14px; font-weight: bold; border: 1px solid #000; width: 24px; height: 24px; line-height: 24px; margin: 0 auto 5px auto;">A</div>' : ''}
                    <span style="font-size: 14px; font-weight: bold; uppercase">${receiptSettings.headerLine1 || 'AROMIX'}</span><br/>
                    <span style="font-size: 10px;">${receiptSettings.headerLine2 || ''}</span>
                    ${receiptSettings.phone ? `<br/><span style="font-size: 9px;">Telp: ${receiptSettings.phone}</span>` : ''}
                </div>
                <div style="font-size: 9px; line-height: 1.3;">
                    No: ${tx.invoiceNumber}<br/>
                    Tanggal: ${new Date(tx.createdAt).toLocaleString('id-ID')}<br/>
                    ${receiptSettings.showCashier ? `Kasir: ${tx.cashierName}<br/>` : ''}
                    Pelanggan: ${tx.customer?.name || 'Umum'}<br/>
                    ${receiptSettings.showPaymentMethod ? `Metode Bayar: ${tx.paymentMethod || 'TUNAI'}<br/>` : ''}
                </div>
                <div class="divider"></div>
                <table>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                <div class="divider"></div>
                <div class="text-right" style="font-size: 12px; font-weight: bold;">
                    TOTAL: Rp ${totalAmountStr}
                </div>
                <div class="divider"></div>
                <div class="text-center" style="font-size: 9px; margin-top: 10px; line-height: 1.3;">
                    ${receiptSettings.footerLine1 || 'Terima Kasih'}<br/>
                    ${receiptSettings.footerLine2 || ''}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleWhatsAppClick = (tx: any) => {
        const phone = tx.customer?.phone;
        if (!phone) {
            setPromptTx(tx);
            setPromptPhone('');
            setIsPromptOpen(true);
            return;
        }
        sendWhatsApp(tx, phone);
    };

    const handleSendWhatsAppPrompt = () => {
        if (!promptTx || !promptPhone) return;
        setIsPromptOpen(false);
        sendWhatsApp(promptTx, promptPhone);
    };

    const sendWhatsApp = (tx: any, phone: string) => {
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
        }

        const itemsText = tx.items.map((item: any) => {
            const name = item.product?.name || item.ingredient?.name || 'Item';
            return `- ${name} (x${item.quantity}): Rp ${parseFloat(item.price).toLocaleString('id-ID')}`;
        }).join('\n');

        let message = waSettings.template;
        message = message.replace(/{NamaPelanggan}/g, tx.customer?.name || 'Pelanggan');
        message = message.replace(/{NoInvoice}/g, tx.invoiceNumber);
        message = message.replace(/{TotalBelanja}/g, `Rp ${parseFloat(tx.totalAmount).toLocaleString('id-ID')}`);
        message = message.replace(/{NamaToko}/g, receiptSettings.headerLine1 || 'Aromix Perfume');
        message = message.replace(/{TanggalTrans}/g, new Date(tx.createdAt).toLocaleString('id-ID'));
        message = message.replace(/{MetodeBayar}/g, tx.paymentMethod || 'TUNAI');
        
        if (message.includes('{DetailBarang}')) {
            message = message.replace(/{DetailBarang}/g, itemsText);
        } else {
            message = message.replace(/{TotalBelanja}/g, `Rp ${parseFloat(tx.totalAmount).toLocaleString('id-ID')}\n\n*Rincian Barang:*\n${itemsText}`);
        }

        const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    if (loading) return <div className="p-10 text-gray-400">Memuat riwayat transaksi...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div className="max-w-full">
                    <h1 className="text-3xl font-bold premium-gradient-text">Riwayat & Laporan</h1>
                    <p className="text-gray-400 mt-1 break-words">Daftar transaksi dan analisis performa penjualan toko Anda.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard/reports'}
                    className="bg-surface border border-border px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:border-accent-gold/50 transition-all text-sm"
                >
                    <BarChart3 size={18} />
                    Lihat Analitik Omzet
                </button>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 w-full md:w-80">
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Metode</th>
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
                                        {tx.items?.reduce((sum: number, it: any) => sum + it.quantity, 0) || 0} Item
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            tx.paymentMethod === 'TUNAI' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            tx.paymentMethod === 'TRANSFER' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            tx.paymentMethod === 'QRIS' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}>
                                            {tx.paymentMethod || 'TUNAI'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-accent-emerald">
                                        Rp {parseFloat(tx.totalAmount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewDetail(tx)}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                                title="Lihat Detail Transaksi"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handlePrint(tx)}
                                                className="p-2 text-gray-500 hover:text-accent-gold transition-colors"
                                                title="Cetak Struk Nota"
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleWhatsAppClick(tx)}
                                                className="p-2 text-gray-500 hover:text-green-400 transition-colors"
                                                title="Kirim Konfirmasi WhatsApp"
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <History size={16} className="text-accent-gold" />
                                            <p>Tidak ada transaksi ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Detail Modal */}
            {isDetailOpen && selectedTx && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-xl p-8 rounded-2xl relative border border-border/80 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-accent-gold">Detail Transaksi</h3>
                                <p className="text-xs text-gray-500 mt-1">{selectedTx.invoiceNumber}</p>
                            </div>
                            <button 
                                onClick={() => setIsDetailOpen(false)}
                                className="p-1 hover:bg-surface rounded-full text-gray-400 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-surface/40 rounded-xl border border-border/50">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Kasir</p>
                                    <p className="font-semibold text-gray-200">{selectedTx.cashierName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Tanggal & Waktu</p>
                                    <p className="font-semibold text-gray-200">
                                        {new Date(selectedTx.createdAt).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Pelanggan</p>
                                    <p className="font-semibold text-gray-200">
                                        {selectedTx.customer?.name || "Umum"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">No. WhatsApp</p>
                                    <p className="font-semibold text-gray-200">
                                        {selectedTx.customer?.phone || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Metode Pembayaran</p>
                                    <p className="font-semibold text-accent-gold">{selectedTx.paymentMethod || "TUNAI"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400 font-bold mb-3">Item Pembelian</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {selectedTx.items?.map((item: any, idx: number) => {
                                        const name = item.product?.name || item.ingredient?.name || "Item";
                                        return (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-surface/20 rounded-lg border border-border/30">
                                                <div>
                                                    <p className="font-medium">{name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.quantity} x Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-gray-200">
                                                    Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 flex justify-between items-center">
                                <span className="text-base font-bold">Total Pembayaran</span>
                                <span className="text-xl font-bold text-accent-emerald">
                                    Rp {parseFloat(selectedTx.totalAmount).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setIsDetailOpen(false);
                                    handlePrint(selectedTx);
                                }}
                                className="bg-surface border border-border px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:border-accent-gold/50 transition-all"
                            >
                                <Printer size={16} />
                                Cetak Nota
                            </button>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="bg-accent-gold text-background px-6 py-2 rounded-xl text-sm font-bold hover:bg-accent-gold/80 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Prompt Modal */}
            {isPromptOpen && promptTx && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-accent-gold mb-2">Nomor WhatsApp Tidak Ditemukan</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Transaksi ini tidak dikaitkan dengan pelanggan terdaftar. Masukkan nomor WhatsApp pelanggan untuk mengirim konfirmasi:
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 uppercase mb-2 font-bold text-gray-300">Nomor WhatsApp (contoh: 08123456789)</label>
                            <input
                                type="text"
                                placeholder="08..."
                                value={promptPhone}
                                onChange={(e) => setPromptPhone(e.target.value)}
                                className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 outline-none focus:border-accent-gold transition-all text-sm text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsPromptOpen(false)}
                                className="bg-surface border border-border px-4 py-2 rounded-xl text-xs font-bold hover:text-white transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSendWhatsAppPrompt}
                                disabled={!promptPhone}
                                className="bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                                Kirim WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
