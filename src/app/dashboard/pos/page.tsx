"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Droplets,
    UserPlus,
    X,
    Users,
    AlertCircle,
    Printer,
    MessageSquare
} from 'lucide-react';

// Product logic
export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        invoiceNumber: '',
        isError: false,
        message: ''
    });

    // Customer states
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', notes: '' });

    // Global bottle states
    const [isOwnBottleGlobal, setIsOwnBottleGlobal] = useState(false);
    const [selectedBottleId, setSelectedBottleId] = useState('');
    const [selectedBottleQty, setSelectedBottleQty] = useState(1);
    const [purchasedBottles, setPurchasedBottles] = useState<any[]>([]);

    // Settings & Created Transaction States
    const [createdTransaction, setCreatedTransaction] = useState<any>(null);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [promptPhone, setPromptPhone] = useState('');

    // Payment method states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('TUNAI');
    const [cashReceived, setCashReceived] = useState('');

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
        if (!tx) return;
        const phone = tx.customer?.phone;
        if (!phone) {
            setPromptPhone('');
            setIsPromptOpen(true);
            return;
        }
        sendWhatsApp(tx, phone);
    };

    const handleSendWhatsAppPrompt = () => {
        if (!createdTransaction || !promptPhone) return;
        setIsPromptOpen(false);
        sendWhatsApp(createdTransaction, promptPhone);
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

    const handleAddBottle = () => {
        if (!selectedBottleId) return;
        const bottleResource = resources.find(r => r.id === selectedBottleId);
        if (!bottleResource) return;

        const existing = purchasedBottles.find(b => b.id === selectedBottleId);
        if (existing) {
            setPurchasedBottles(purchasedBottles.map(b => 
                b.id === selectedBottleId 
                    ? { ...b, quantity: b.quantity + selectedBottleQty } 
                    : b
            ));
        } else {
            setPurchasedBottles([...purchasedBottles, {
                id: bottleResource.id,
                name: bottleResource.name,
                price: parseFloat(bottleResource.price),
                quantity: selectedBottleQty
            }]);
        }
        
        setSelectedBottleId('');
        setSelectedBottleQty(1);
    };

    const handleRemoveBottle = (id: string) => {
        setPurchasedBottles(purchasedBottles.filter(b => b.id !== id));
    };

    useEffect(() => {
        fetchProducts();
        fetchResources();
        fetchCustomers();

        const savedReceipt = localStorage.getItem('aromix_receipt_settings');
        if (savedReceipt) {
            try { setReceiptSettings(JSON.parse(savedReceipt)); } catch (e) {}
        }
        const savedWa = localStorage.getItem('aromix_wa_settings');
        if (savedWa) {
            try { setWaSettings(JSON.parse(savedWa)); } catch (e) {}
        }
    }, []);

    const fetchResources = async () => {
        const res = await fetch('/api/ingredients');
        const data = await res.json();
        setResources(data);
    };

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
    };

    const fetchCustomers = async () => {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingCustomer(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });
            const data = await res.json();
            if (res.ok) {
                setCustomers([...customers, data]);
                setSelectedCustomer(data);
                setIsCustomerModalOpen(false);
                setNewCustomer({ name: '', phone: '', email: '', notes: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAddingCustomer(false);
        }
    };

    const addToCart = (item: any) => {
        const id = `${item.id}-${Date.now()}`; // Unique ID for cart items
        setCart([...cart, {
            ...item,
            cartId: id,
            quantity: 1,
            isIngredient: !!item.isIngredient
        }]);
    };

    const handleCheckout = () => {
        if (cart.length === 0 && purchasedBottles.length === 0) return;
        setCashReceived('');
        setPaymentMethod('TUNAI');
        setIsPaymentModalOpen(true);
    };

    const confirmCheckout = async () => {
        setIsPaymentModalOpen(false);
        setIsProcessing(true);

        try {
            const transactionItems = [
                ...cart.map(item => ({
                    productId: item.isIngredient ? null : item.id,
                    ingredientId: item.isIngredient ? item.id : null,
                    quantity: item.quantity,
                    isOwnBottle: isOwnBottleGlobal,
                    bottleId: null
                })),
                ...(!isOwnBottleGlobal ? purchasedBottles.map(b => ({
                    productId: null,
                    ingredientId: b.id,
                    quantity: b.quantity,
                    isOwnBottle: false,
                    bottleId: null
                })) : [])
            ];

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: transactionItems,
                    customerId: selectedCustomer?.id || null,
                    paymentMethod
                })
            });

            const data = await res.json();

            if (res.ok) {
                setCreatedTransaction(data);
                setSuccessModal({
                    isOpen: true,
                    invoiceNumber: data.invoiceNumber,
                    isError: false,
                    message: 'Transaksi Anda telah berhasil diproses.'
                });
                setCart([]);
                setPurchasedBottles([]);
                setIsOwnBottleGlobal(false);
                setSelectedCustomer(null);
                fetchProducts(); // Refresh stock
            } else {
                setSuccessModal({
                    isOpen: true,
                    invoiceNumber: '',
                    isError: true,
                    message: data.error || 'Terjadi kesalahan saat memproses transaksi.'
                });
            }
        } catch (error) {
            setSuccessModal({
                isOpen: true,
                invoiceNumber: '',
                isError: true,
                message: 'Terjadi kesalahan koneksi sistem.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const updateItem = (cartId: string, updates: any) => {
        setCart(cart.map(item => item.cartId === cartId ? { ...item, ...updates } : item));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
        (!isOwnBottleGlobal ? purchasedBottles.reduce((sum, b) => sum + (b.price * b.quantity), 0) : 0);

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
            {/* Product Selection Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                <header className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-2xl font-bold break-words">Kasir / POS</h1>

                        {/* Searchable Customer Selection */}
                        <div className="flex items-center gap-2 w-full sm:w-auto relative">
                            <div className="relative flex-1 sm:w-80">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari nama / telp pelanggan..."
                                    className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-10 text-sm focus:border-accent-gold outline-none transition-all"
                                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        if (selectedCustomer) setSelectedCustomer(null);
                                        setIsCustomerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsCustomerDropdownOpen(true)}
                                />
                                {selectedCustomer && (
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setCustomerSearch('');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {customers
                                            .filter(c =>
                                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                (c.phone && c.phone.includes(customerSearch))
                                            ).length > 0 ? (
                                            customers
                                                .filter(c =>
                                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                                    (c.phone && c.phone.includes(customerSearch))
                                                ).map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setCustomerSearch('');
                                                            setIsCustomerDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-background border-b border-border/50 last:border-0 transition-colors group"
                                                    >
                                                        <div className="font-medium group-hover:text-accent-gold">{c.name}</div>
                                                        {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                                                    </button>
                                                ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Pelanggan tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="p-2.5 bg-surface border border-border rounded-xl hover:text-accent-gold transition-colors"
                                title="Tambah Pelanggan Baru"
                            >
                                <UserPlus size={20} />
                            </button>

                            {/* Backdrop to close dropdown */}
                            {isCustomerDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsCustomerDropdownOpen(false)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Cari parfum atau scan barcode..."
                            className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 focus:border-accent-gold outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const query = search.trim().toLowerCase();
                                    if (!query) return;
                                    const matched = products.find(p => p.code && p.code.trim().toLowerCase() === query);
                                    if (matched) {
                                        addToCart({ ...matched, price: parseFloat(matched.price) });
                                        setSearch('');
                                    }
                                }
                            }}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                        ...products.map(p => ({ ...p, price: parseFloat(p.price) })),
                        ...resources.filter(r => parseFloat(r.price) > 0).map(r => ({ ...r, price: parseFloat(r.price), isIngredient: true }))
                    ].filter(p => 
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
                    ).map(item => (
                        <div
                            key={item.isIngredient ? `ing-${item.id}` : item.id}
                            onClick={() => addToCart(item)}
                            className="glass-panel p-5 rounded-2xl cursor-pointer hover:border-accent-gold transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-background p-3 rounded-xl border border-border group-hover:border-accent-gold/50 transition-all">
                                    {item.isIngredient ? (
                                        <Plus className="text-accent-gold" />
                                    ) : (
                                        <Droplets className="text-accent-gold" />
                                    )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.stock < 10
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-accent-emerald/10 text-accent-emerald'
                                    }`}>
                                    {item.isFormula && <span className="text-[10px] opacity-70 mr-1">RACIKAN:</span>}
                                    {item.isIngredient && <span className="text-[10px] opacity-70 mr-1">{item.type}:</span>}
                                    Stok: {item.stock} {item.unit || ''}
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                            {item.code && (
                                <p className="text-[10px] text-gray-500 font-mono mb-2">Barcode: {item.code}</p>
                            )}
                            <p className="text-accent-gold font-bold">Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout Area */}
            <div className="w-full lg:w-[400px] glass-panel border-l-0 lg:border-l border-border flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Keranjang
                        </h2>
                        {selectedCustomer && (
                            <span className="text-xs text-accent-gold font-medium mt-1">
                                Pelanggan: {selectedCustomer.name}
                            </span>
                        )}
                    </div>
                    <span className="bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded-md">
                        {cart.length + purchasedBottles.length} ITEM
                    </span>
                </div>

                {/* Opsi Wadah / Botol */}
                <div className="p-4 border-b border-border bg-background/40 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isOwnBottleGlobal}
                                onChange={(e) => {
                                    setIsOwnBottleGlobal(e.target.checked);
                                    if (e.target.checked) {
                                        setPurchasedBottles([]);
                                    }
                                }}
                                className="w-4 h-4 rounded border-border bg-background text-accent-gold focus:ring-accent-gold"
                            />
                            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Bawa Botol Sendiri</span>
                        </label>
                    </div>

                    {!isOwnBottleGlobal && (
                        <div className="space-y-2.5">
                            <div className="flex gap-2">
                                <select
                                    id="bottle-select"
                                    className="flex-1 bg-background border border-border rounded-xl text-xs px-3 py-2 outline-none font-bold"
                                    value={selectedBottleId}
                                    onChange={(e) => setSelectedBottleId(e.target.value)}
                                >
                                    <option value="">Pilih Botol...</option>
                                    {resources.filter(r => r.type === 'BOTOL').map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} - Rp {parseFloat(r.price).toLocaleString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                                
                                <select
                                    id="bottle-qty-select"
                                    className="bg-background border border-border rounded-xl text-xs px-3 py-2 outline-none font-bold w-16 text-center"
                                    value={selectedBottleQty}
                                    onChange={(e) => setSelectedBottleQty(parseInt(e.target.value) || 1)}
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={handleAddBottle}
                                    className="px-3 py-2 bg-accent-gold text-black rounded-xl text-xs font-bold hover:bg-white transition-colors"
                                >
                                    + Tambah
                                </button>
                            </div>

                            {/* List of Purchased Bottles */}
                            {purchasedBottles.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Botol yang Dibeli:</span>
                                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                        {purchasedBottles.map(b => (
                                            <div key={b.id} className="flex justify-between items-center bg-surface border border-border/50 rounded-lg p-2 text-xs animate-in fade-in">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{b.name}</span>
                                                    <span className="text-[10px] text-gray-400">Rp {b.price.toLocaleString('id-ID')} x {b.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-accent-gold">Rp {(b.price * b.quantity).toLocaleString('id-ID')}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveBottle(b.id)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 && purchasedBottles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p>Belum ada produk</p>
                        </div>
                    ) : (
                        cart.map(item => {
                            const itemSubtotal = item.price * item.quantity;

                            return (
                                <div key={item.cartId} className="bg-surface rounded-xl p-4 border border-border space-y-3 animate-in fade-in">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-sm">{item.name}</span>
                                        <button onClick={() => removeFromCart(item.cartId)} className="text-gray-500 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center bg-background rounded-lg border border-border p-2">
                                        <span className="text-xs text-gray-500">Jumlah (ml/pcs)</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateItem(item.cartId, { quantity: Math.max(0, item.quantity - 1) })} className="p-1 hover:text-accent-gold"><Minus size={14} /></button>
                                            <input
                                                type="number"
                                                className="bg-transparent w-12 text-center text-sm outline-none"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.cartId, { quantity: parseFloat(e.target.value) || 0 })}
                                            />
                                            <button onClick={() => updateItem(item.cartId, { quantity: item.quantity + 1 })} className="p-1 hover:text-accent-gold"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <span className="font-bold text-sm text-accent-gold">Rp {itemSubtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-6 pb-28 md:pb-6 bg-surface border-t border-border">
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-400">Total Harga</span>
                        <span className="text-2xl font-bold text-accent-gold">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                        disabled={(cart.length === 0 && purchasedBottles.length === 0) || isProcessing}
                        onClick={handleCheckout}
                        className="w-full bg-foreground text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50 disabled:hover:bg-foreground"
                    >
                        {isProcessing ? 'Memproses...' : (
                            <>
                                <CheckCircle2 size={20} />
                                Bayar Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Customer Add Modal */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold">Tambah Pelanggan Baru</h2>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nomor Telepon</label>
                                <input
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Catatan</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold resize-none"
                                    rows={3}
                                    value={newCustomer.notes}
                                    onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingCustomer}
                                    className="flex-1 px-4 py-3 rounded-xl bg-foreground text-background font-bold hover:bg-accent-gold transition-all disabled:opacity-50"
                                >
                                    {isAddingCustomer ? 'Menyimpan...' : 'Simpan Pelanggan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Transaction Confirmation Modal */}
            {successModal.isOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center space-y-6 relative group animate-in scale-in duration-300">
                        {/* Elegant background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 blur-3xl -mr-10 -mt-10" />

                        {/* Status Icon */}
                        <div className="mx-auto w-20 h-20 bg-background/50 border border-border rounded-full flex items-center justify-center shadow-lg relative z-10">
                            {successModal.isError ? (
                                <AlertCircle size={40} className="text-red-500 animate-bounce" />
                            ) : (
                                <CheckCircle2 size={40} className="text-accent-gold animate-pulse" />
                            )}
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase premium-gradient-text">
                                {successModal.isError ? 'Transaksi Gagal' : 'Transaksi Sukses'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {successModal.message}
                            </p>
                        </div>

                        {/* Invoice Detail (only if success) */}
                        {!successModal.isError && successModal.invoiceNumber && (
                            <div className="space-y-1 relative z-10">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nomor Invoice</span>
                                <div className="font-mono text-xs font-bold text-accent-gold bg-accent-gold/10 border border-accent-gold/20 px-4 py-2.5 rounded-2xl inline-block shadow-inner select-all">
                                    {successModal.invoiceNumber}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-col gap-3 relative z-10">
                            {!successModal.isError && (
                                <div className="flex gap-2 w-full">
                                    <button 
                                        onClick={() => handlePrint(createdTransaction)}
                                        className="flex-1 bg-surface border border-border text-gray-300 hover:text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:border-accent-gold/30 transition-all text-xs uppercase tracking-wider"
                                    >
                                        <Printer size={16} />
                                        Struk
                                    </button>
                                    <button 
                                        onClick={() => handleWhatsAppClick(createdTransaction)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
                                    >
                                        <MessageSquare size={16} />
                                        WhatsApp
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
                                className="w-full bg-accent-gold text-black font-black py-3.5 rounded-2xl hover:bg-white transition-all text-xs uppercase tracking-widest shadow-glass-gold"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* WhatsApp Prompt Modal */}
            {isPromptOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in scale-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-accent-gold">Nomor WhatsApp Pelanggan</h3>
                            <button onClick={() => setIsPromptOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Transaksi ini tidak terikat dengan data pelanggan. Masukkan nomor WhatsApp pelanggan untuk mengirim nota belanja:
                        </p>
                        <div>
                            <input
                                type="text"
                                placeholder="08..."
                                value={promptPhone}
                                onChange={(e) => setPromptPhone(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold text-sm text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPromptOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-surface transition-all text-xs font-bold text-gray-400"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSendWhatsAppPrompt}
                                disabled={!promptPhone}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all text-xs disabled:opacity-50"
                            >
                                Kirim
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Selection Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6 animate-in scale-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-accent-gold">Pilih Metode Pembayaran</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        
                        <div className="text-center p-4 bg-background/50 rounded-xl border border-border">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Tagihan</span>
                            <h2 className="text-2xl font-black text-white mt-1">Rp {total.toLocaleString('id-ID')}</h2>
                        </div>

                        <div className="space-y-2.5">
                            <label className="block text-xs text-gray-500 uppercase font-bold">Pilih Opsi Metode</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['TUNAI', 'TRANSFER', 'QRIS', 'KARTU'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod(method);
                                            if (method !== 'TUNAI') setCashReceived('');
                                        }}
                                        className={`py-3 rounded-xl border font-bold text-xs tracking-wider transition-all ${
                                            paymentMethod === method
                                                ? 'bg-accent-gold border-accent-gold text-background'
                                                : 'bg-surface/50 border-border text-gray-400 hover:text-white hover:border-gray-500'
                                        }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentMethod === 'TUNAI' && (
                            <div className="space-y-3 p-4 bg-surface/30 border border-border/50 rounded-xl">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1.5">Uang Diterima (Rp)</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: 50000"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold text-sm text-white font-mono"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setCashReceived(total.toString())}
                                        className="px-2.5 py-1 bg-background border border-border rounded-lg text-[10px] font-bold text-gray-400 hover:text-accent-gold hover:border-accent-gold/40 transition-all"
                                    >
                                        Uang Pas
                                    </button>
                                    {[10000, 20000, 50000, 100000].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setCashReceived(val.toString())}
                                            className="px-2.5 py-1 bg-background border border-border rounded-lg text-[10px] font-bold text-gray-400 hover:text-accent-gold hover:border-accent-gold/40 transition-all"
                                        >
                                            Rp {val.toLocaleString('id-ID')}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-border/50 pt-2 flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Uang Kembalian:</span>
                                    <span className="font-bold text-accent-emerald text-sm font-mono">
                                        Rp {(parseFloat(cashReceived) > total ? parseFloat(cashReceived) - total : 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-border hover:bg-surface text-xs font-bold text-gray-400"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmCheckout}
                                disabled={paymentMethod === 'TUNAI' && cashReceived !== '' && (parseFloat(cashReceived) || 0) < total}
                                className="flex-1 py-3 rounded-xl bg-accent-gold text-black font-black text-xs hover:bg-accent-gold/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Konfirmasi & Bayar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
