"use client";

import React, { useState, useEffect } from 'react';
import {
    User,
    Store,
    Bell,
    Shield,
    Lock,
    Save,
    CheckCircle2,
    AlertCircle,
    Info,
    MessageSquare,
    FileText,
    Smartphone,
    RefreshCw,
    Check,
    Eye,
    EyeOff,
    Users,
    Plus,
    Trash2,
    UserPlus,
    X,
    Key
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [userProfile, setUserProfile] = useState({ name: '', email: '' });
    const [storeProfile, setStoreProfile] = useState({ name: '', address: '', phone: '' });

    // Password change states
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [isChangingPass, setIsChangingPass] = useState(false);

    // WhatsApp Notification States
    const [waSettings, setWaSettings] = useState({
        provider: 'Fonnte (Rekomendasi)',
        gatewayNumber: '+62 812-3456-7890',
        apiToken: 'AromixGatewayTokenSample2026',
        isConnected: true,
        sendReceipt: true,
        dailyReport: false,
        lowStockAlert: true,
        template: 'Halo {NamaPelanggan},\n\nTerima kasih telah berbelanja di {NamaToko}.\nNo. Invoice: {NoInvoice}\nTotal Belanja: {TotalBelanja}\n\nSemoga hari Anda wangi & menyenangkan!'
    });
    const [showToken, setShowToken] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    // Receipt / Nota States
    const [receiptSettings, setReceiptSettings] = useState({
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

    // Staff Management States
    const [staffList, setStaffList] = useState<any[]>([]);
    const [fetchingStaff, setFetchingStaff] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedStaffForReset, setSelectedStaffForReset] = useState<any>(null);
    const [resetPassword, setResetPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const fetchStaff = async () => {
        setFetchingStaff(true);
        try {
            const res = await fetch('/api/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingStaff(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (staffForm.password !== staffForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
            return;
        }

        setIsAddingStaff(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: staffForm.name,
                    email: staffForm.email,
                    password: staffForm.password
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Akun Kasir berhasil ditambahkan!' });
                setStaffForm({ name: '', email: '', password: '', confirmPassword: '' });
                setIsStaffModalOpen(false);
                fetchStaff(); // Refresh list
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Gagal menambahkan akun kasir.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
        } finally {
            setIsAddingStaff(false);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus akun kasir ini?')) return;
        
        try {
            const res = await fetch(`/api/staff?id=${staffId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Akun Kasir berhasil dihapus.' });
                fetchStaff(); // Refresh list
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Gagal menghapus akun kasir.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaffForReset || !resetPassword) return;

        setIsResettingPassword(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/staff', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedStaffForReset.id,
                    password: resetPassword
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Password untuk kasir ${selectedStaffForReset.name} berhasil diubah!` });
                setResetPassword('');
                setIsResetModalOpen(false);
                setSelectedStaffForReset(null);
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Gagal mengubah password.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
        } finally {
            setIsResettingPassword(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        const tab = new URLSearchParams(window.location.search).get('tab');
        if (tab) setActiveTab(tab);

        // Load settings from localStorage
        const savedWa = localStorage.getItem('aromix_wa_settings');
        if (savedWa) {
            try { setWaSettings(JSON.parse(savedWa)); } catch (e) {}
        }
        const savedReceipt = localStorage.getItem('aromix_receipt_settings');
        if (savedReceipt) {
            try { setReceiptSettings(JSON.parse(savedReceipt)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'users' && session?.user?.role === 'OWNER') {
            fetchStaff();
        }
    }, [activeTab, session]);

    const handleSaveWa = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem('aromix_wa_settings', JSON.stringify(waSettings));
            setMessage({ type: 'success', text: 'Konfigurasi Notifikasi WhatsApp berhasil disimpan!' });
            setSaving(false);
        }, 600);
    };

    const handleSaveReceipt = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem('aromix_receipt_settings', JSON.stringify(receiptSettings));
            setMessage({ type: 'success', text: 'Pengaturan Struk / Nota berhasil disimpan!' });
            setSaving(false);
        }, 600);
    };

    const testWaConnection = () => {
        setTestingConnection(true);
        setTimeout(() => {
            setTestingConnection(false);
            setWaSettings(prev => ({ ...prev, isConnected: true }));
            setMessage({ type: 'success', text: 'Gateway WhatsApp terhubung dengan sukses!' });
        }, 1500);
    };

    const fetchSettings = async () => {
        try {
            const [uRes, sRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/store')
            ]);

            if (uRes.ok) setUserProfile(await uRes.json());
            if (sRes.ok) setStoreProfile(await sRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userProfile)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil pengguna berhasil diperbarui!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/store', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storeProfile)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Informasi toko berhasil diperbarui!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memperbarui informasi toko.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
            return;
        }

        setIsChangingPass(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password Anda berhasil diperbarui!' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal mengubah password.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' });
        } finally {
            setIsChangingPass(false);
        }
    };

    if (loading) return <div className="p-10 text-gray-400">Memuat konfigurasi...</div>;

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold premium-gradient-text">Pengaturan</h1>
                <p className="text-gray-400 mt-1">Kelola preferensi akun dan informasi operasional toko Anda.</p>
            </header>

            {message.text && (
                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-xs opacity-50 hover:opacity-100">Tutup</button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                        icon={<User size={18} />}
                        label="Profil Saya"
                    />
                    {session?.user?.role === 'OWNER' && (
                        <TabButton
                            active={activeTab === 'store'}
                            onClick={() => setActiveTab('store')}
                            icon={<Store size={18} />}
                            label="Informasi Toko"
                        />
                    )}
                    {session?.user?.role === 'OWNER' && (
                        <>
                            <TabButton
                                active={activeTab === 'whatsapp'}
                                onClick={() => setActiveTab('whatsapp')}
                                icon={<MessageSquare size={18} />}
                                label="Notifikasi WhatsApp"
                            />
                            <TabButton
                                active={activeTab === 'receipt'}
                                onClick={() => setActiveTab('receipt')}
                                icon={<FileText size={18} />}
                                label="Struk & Nota"
                            />
                            <TabButton
                                active={activeTab === 'users'}
                                onClick={() => setActiveTab('users')}
                                icon={<Users size={18} />}
                                label="Manajemen Kasir"
                            />
                        </>
                    )}
                    <TabButton
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                        icon={<Lock size={18} />}
                        label="Keamanan"
                    />
                </aside>

                {/* Tab Content */}
                <main className="flex-1">
                    <div className="glass-panel p-8 rounded-3xl animate-scale-in">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <User className="text-accent-gold" size={20} />
                                    Profil Pengguna
                                </h3>
                                <div className="space-y-4">
                                    <FormInput
                                        label="Nama Lengkap"
                                        value={userProfile.name}
                                        onChange={v => setUserProfile({ ...userProfile, name: v })}
                                    />
                                    <FormInput
                                        label="Email"
                                        type="email"
                                        value={userProfile.email}
                                        onChange={v => setUserProfile({ ...userProfile, email: v })}
                                        disabled
                                    />
                                    <div className="pt-2">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Role Akun</p>
                                        <span className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-bold text-accent-gold">
                                            {session?.user?.role}
                                        </span>
                                    </div>
                                </div>
                                <button disabled={saving} type="submit" className="mt-8 bg-foreground text-background px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50">
                                    <Save size={18} />
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'store' && (
                            <form onSubmit={handleSaveStore} className="space-y-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Store className="text-accent-gold" size={20} />
                                    Identitas Toko
                                </h3>
                                <div className="space-y-4">
                                    <FormInput
                                        label="Nama Toko / Outlet"
                                        value={storeProfile.name}
                                        onChange={v => setStoreProfile({ ...storeProfile, name: v })}
                                    />
                                    <FormInput
                                        label="Nomor Telepon Toko"
                                        value={storeProfile.phone || ''}
                                        onChange={v => setStoreProfile({ ...storeProfile, phone: v })}
                                    />
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Alamat Lengkap</label>
                                        <textarea
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-gold transition-all text-sm min-h-[100px]"
                                            value={storeProfile.address || ''}
                                            onChange={e => setStoreProfile({ ...storeProfile, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button disabled={saving} type="submit" className="mt-8 bg-foreground text-background px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50">
                                    <Save size={18} />
                                    {saving ? 'Menyimpan...' : 'Simpan Informasi Toko'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Lock className="text-accent-gold" size={20} />
                                    Keamanan Akun
                                </h3>
                                <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl flex items-start gap-3 mb-6">
                                    <Shield className="text-accent-gold shrink-0 mt-0.5" size={20} />
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Gunakan password yang kuat untuk melindungi akun Anda. Hindari menggunakan kata sandi yang mudah ditebak atau digunakan di layanan lain.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <FormInput
                                        label="Password Saat Ini"
                                        type="password"
                                        value={passwords.current}
                                        onChange={v => setPasswords({ ...passwords, current: v })}
                                        required
                                    />
                                    <hr className="border-border opacity-50 my-2" />
                                    <FormInput
                                        label="Password Baru"
                                        type="password"
                                        value={passwords.new}
                                        onChange={v => setPasswords({ ...passwords, new: v })}
                                        required
                                    />
                                    <FormInput
                                        label="Konfirmasi Password Baru"
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={v => setPasswords({ ...passwords, confirm: v })}
                                        required
                                    />
                                </div>
                                <button
                                    disabled={isChangingPass}
                                    type="submit"
                                    className="mt-8 bg-foreground text-background px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50"
                                >
                                    <Lock size={18} />
                                    {isChangingPass ? 'Memproses...' : 'Ubah Password'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'whatsapp' && (
                            <form onSubmit={handleSaveWa} className="space-y-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <MessageSquare className="text-accent-gold" size={20} />
                                    Notifikasi WhatsApp
                                </h3>

                                <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl flex items-start gap-3">
                                    <Smartphone className="text-accent-gold shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-xs font-bold text-white mb-1">WhatsApp Gateway Integration</p>
                                        <p className="text-[11px] text-gray-400 leading-relaxed">
                                            Integrasikan sistem kasir AROMIX dengan WhatsApp Gateway untuk mengirim nota digital otomatis dan laporan operasional secara real-time.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Provider Gateway</label>
                                        <select 
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                            value={waSettings.provider}
                                            onChange={e => setWaSettings({ ...waSettings, provider: e.target.value })}
                                        >
                                            <option value="Fonnte (Rekomendasi)">Fonnte (Rekomendasi)</option>
                                            <option value="Wablas">Wablas</option>
                                            <option value="Ruangguru WA Gateway">Ruangguru WA Gateway</option>
                                            <option value="Mock Gateway (Demo)">Mock Gateway (Demo)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Nomor Pengirim (Gateway)</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                            value={waSettings.gatewayNumber}
                                            onChange={e => setWaSettings({ ...waSettings, gatewayNumber: e.target.value })}
                                            placeholder="+62..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Token API / Auth Key</label>
                                    <div className="relative">
                                        <input 
                                            type={showToken ? "text" : "password"}
                                            className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white font-mono"
                                            value={waSettings.apiToken}
                                            onChange={e => setWaSettings({ ...waSettings, apiToken: e.target.value })}
                                            placeholder="Masukkan token API gateway Anda"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowToken(!showToken)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-border rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${waSettings.isConnected ? 'bg-accent-emerald animate-pulse' : 'bg-red-500'}`} />
                                        <span className="text-sm font-medium text-gray-300">
                                            Status Gateway: <strong className={waSettings.isConnected ? 'text-accent-emerald' : 'text-red-500'}>{waSettings.isConnected ? 'Terhubung' : 'Terputus'}</strong>
                                        </span>
                                    </div>
                                    <button 
                                        type="button"
                                        disabled={testingConnection}
                                        onClick={testWaConnection}
                                        className="bg-surface/50 border border-border px-4 py-2 rounded-xl text-xs font-bold hover:border-accent-gold/40 flex items-center gap-2 hover:bg-background transition-all text-white disabled:opacity-50"
                                    >
                                        <RefreshCw size={12} className={testingConnection ? "animate-spin text-accent-gold" : "text-gray-400"} />
                                        {testingConnection ? "Menguji..." : "Uji Koneksi"}
                                    </button>
                                </div>

                                <hr className="border-border my-2" />

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Picu & Otomatisasi</h4>
                                    
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-white">Kirim Struk ke Pelanggan</p>
                                            <p className="text-xs text-gray-500">Kirim nota digital ke nomor WhatsApp pelanggan setelah checkout selesai.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={waSettings.sendReceipt}
                                            onChange={e => setWaSettings({ ...waSettings, sendReceipt: e.target.checked })}
                                            className="w-4 h-4 accent-accent-gold cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-white">Notifikasi Stok Menipis</p>
                                            <p className="text-xs text-gray-500">Kirim notifikasi peringatan ke Owner jika ada bahan baku di bawah stok minimum.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={waSettings.lowStockAlert}
                                            onChange={e => setWaSettings({ ...waSettings, lowStockAlert: e.target.checked })}
                                            className="w-4 h-4 accent-accent-gold cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-white">Laporan Harian Omzet (Owner)</p>
                                            <p className="text-xs text-gray-500">Kirim rangkuman penjualan harian otomatis ke Owner setiap pukul 21:00 WIB.</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={waSettings.dailyReport}
                                            onChange={e => setWaSettings({ ...waSettings, dailyReport: e.target.checked })}
                                            className="w-4 h-4 accent-accent-gold cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-400">Template Struk WhatsApp</label>
                                    <textarea 
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-accent-gold transition-all text-xs font-mono min-h-[140px] text-white leading-relaxed"
                                        value={waSettings.template}
                                        onChange={e => setWaSettings({ ...waSettings, template: e.target.value })}
                                    />
                                    <div className="p-3 bg-surface/50 border border-border/50 rounded-xl">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Variabel yang Didukung</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['{NamaPelanggan}', '{NoInvoice}', '{TotalBelanja}', '{NamaToko}', '{TanggalTrans}'].map((v, i) => (
                                                <code key={i} className="px-2 py-0.5 bg-background border border-border rounded text-[10px] text-accent-gold font-mono">{v}</code>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button disabled={saving} type="submit" className="mt-8 bg-foreground text-background px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50">
                                    <Save size={18} />
                                    {saving ? 'Menyimpan...' : 'Simpan Konfigurasi WhatsApp'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'receipt' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <FileText className="text-accent-gold" size={20} />
                                        Pengaturan Struk / Nota Belanja
                                    </h3>
                                    <p className="text-xs text-gray-400">Kustomisasi tata letak, ukuran, logo, dan footer nota cetak untuk pelanggan.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Settings Form */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-surface/30 transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-white">Tampilkan Logo Toko</p>
                                                    <p className="text-xs text-gray-500">Cetak logo ikonik AROMIX di bagian paling atas struk.</p>
                                                </div>
                                                <input 
                                                    type="checkbox"
                                                    checked={receiptSettings.showLogo}
                                                    onChange={e => setReceiptSettings({ ...receiptSettings, showLogo: e.target.checked })}
                                                    className="w-4 h-4 accent-accent-gold cursor-pointer"
                                                />
                                            </div>

                                            <FormInput 
                                                label="Header Baris 1 (Nama Toko)"
                                                value={receiptSettings.headerLine1}
                                                onChange={v => setReceiptSettings({ ...receiptSettings, headerLine1: v })}
                                            />

                                            <FormInput 
                                                label="Header Baris 2 (Slogan / Keterangan)"
                                                value={receiptSettings.headerLine2}
                                                onChange={v => setReceiptSettings({ ...receiptSettings, headerLine2: v })}
                                            />

                                            <FormInput 
                                                label="Nomor Kontak di Struk"
                                                value={receiptSettings.phone}
                                                onChange={v => setReceiptSettings({ ...receiptSettings, phone: v })}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1.5">Ukuran Kertas Struk</label>
                                                    <select 
                                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                                        value={receiptSettings.paperSize}
                                                        onChange={e => setReceiptSettings({ ...receiptSettings, paperSize: e.target.value })}
                                                    >
                                                        <option value="58mm">58mm (Thermal Standar)</option>
                                                        <option value="80mm">80mm (Thermal Lebar)</option>
                                                    </select>
                                                </div>

                                                <div className="flex flex-col justify-end pb-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-gray-400">Tampilkan Nama Kasir</span>
                                                        <input 
                                                            type="checkbox"
                                                            checked={receiptSettings.showCashier}
                                                            onChange={e => setReceiptSettings({ ...receiptSettings, showCashier: e.target.checked })}
                                                            className="w-4 h-4 accent-accent-gold cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <FormInput 
                                                label="Footer Baris 1 (Ucapan)"
                                                value={receiptSettings.footerLine1}
                                                onChange={v => setReceiptSettings({ ...receiptSettings, footerLine1: v })}
                                            />

                                            <FormInput 
                                                label="Footer Baris 2 (Ketentuan Retur)"
                                                value={receiptSettings.footerLine2}
                                                onChange={v => setReceiptSettings({ ...receiptSettings, footerLine2: v })}
                                            />
                                        </div>

                                        <button onClick={handleSaveReceipt} disabled={saving} type="button" className="w-full md:w-auto bg-foreground text-background px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-gold transition-all disabled:opacity-50">
                                            <Save size={18} />
                                            {saving ? 'Menyimpan...' : 'Simpan Pengaturan Struk'}
                                        </button>
                                    </div>

                                    {/* Receipt Live Preview (thermal paper styled) */}
                                    <div className="lg:col-span-5 flex flex-col">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Live Preview Nota</span>
                                        <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-2xl border-4 border-dashed border-slate-300 relative overflow-hidden select-none">
                                            {/* Top Cut line effect */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-transparent" />
                                            
                                            <div className="font-mono text-[10px] leading-relaxed space-y-4">
                                                {/* Header */}
                                                <div className="text-center space-y-1">
                                                    {receiptSettings.showLogo && (
                                                        <div className="w-8 h-8 mx-auto border-2 border-slate-800 rounded-lg flex items-center justify-center font-black text-xs mb-1">
                                                            A
                                                        </div>
                                                    )}
                                                    <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 break-words">{receiptSettings.headerLine1 || 'NAMA TOKO'}</h4>
                                                    <p className="text-[9px] font-medium text-slate-500 break-words">{receiptSettings.headerLine2}</p>
                                                    <p className="text-[8px] text-slate-500">Telp: {receiptSettings.phone}</p>
                                                </div>

                                                <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] space-y-0.5 text-slate-500">
                                                    <div className="flex justify-between">
                                                        <span>Invoice: INV-20260526-003</span>
                                                        <span>26/05/2026 13:54</span>
                                                    </div>
                                                    {receiptSettings.showCashier && (
                                                        <div>Kasir: {session?.user?.name || 'Administrator'}</div>
                                                    )}
                                                </div>

                                                {/* Items */}
                                                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-slate-700">
                                                    <div className="flex justify-between font-bold text-slate-900">
                                                        <span>Item</span>
                                                        <span>Total</span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="flex justify-between">
                                                            <span>1x Custom Perfume Lavender 50ml</span>
                                                            <span>Rp 120.000</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>1x Premium Spray Bottle Silver</span>
                                                            <span>Rp 15.000</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Totals */}
                                                <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 font-bold text-slate-800 text-[11px]">
                                                    <div className="flex justify-between">
                                                        <span>TOTAL BELANJA</span>
                                                        <span className="text-slate-900">Rp 135.000</span>
                                                    </div>
                                                    <div className="flex justify-between font-normal text-[9px] text-slate-600">
                                                        <span>METODE: TUNAI</span>
                                                        <span>BAYAR: Rp 150.000</span>
                                                    </div>
                                                    <div className="flex justify-between font-normal text-[9px] text-slate-600">
                                                        <span>KEMBALI</span>
                                                        <span>Rp 15.000</span>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[8px] text-slate-500 space-y-1 leading-normal">
                                                    <p className="font-bold text-slate-700 uppercase">{receiptSettings.footerLine1}</p>
                                                    <p className="italic">{receiptSettings.footerLine2}</p>
                                                </div>

                                                {/* Simulated Barcode */}
                                                <div className="pt-2 flex flex-col items-center gap-1 opacity-80">
                                                    <div className="flex items-center gap-[1px] h-6 bg-slate-900 px-4 py-1">
                                                        {[1,3,1,2,4,1,3,2,1,4,1,2,3,1,2,4,1].map((w, idx) => (
                                                            <div key={idx} className="h-full bg-slate-900" style={{ width: `${w}px` }} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[7px] font-mono tracking-widest text-slate-400">INV20260526003</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Users className="text-accent-gold" size={20} />
                                            Manajemen Kasir
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">Kelola hak akses dan akun kasir/staf untuk outlet Anda.</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsStaffModalOpen(true)}
                                        className="bg-accent-gold text-black hover:bg-white transition-all font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-widest shadow-glass-gold flex items-center gap-2 self-start sm:self-auto"
                                    >
                                        <UserPlus size={16} />
                                        Tambah Kasir
                                    </button>
                                </div>

                                <hr className="border-border opacity-50" />

                                {fetchingStaff ? (
                                    <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-2 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin" />
                                        <p className="text-xs font-bold uppercase tracking-wider animate-pulse">Memuat Data Kasir...</p>
                                    </div>
                                ) : staffList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staffList.map((staff) => (
                                            <div key={staff.id} className="bg-surface/30 border border-border/50 p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-accent-gold/20 transition-all group">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-11 h-11 bg-accent-gold/10 rounded-xl flex items-center justify-center border border-accent-gold/20 font-black text-accent-gold uppercase shrink-0">
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-sm text-white truncate">{staff.name}</h4>
                                                        <p className="text-xs font-mono text-gray-500 truncate">{staff.email}</p>
                                                        <span className="text-[9px] text-gray-600 block mt-1">
                                                            Terdaftar: {new Date(staff.createdAt).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedStaffForReset(staff);
                                                            setIsResetModalOpen(true);
                                                        }}
                                                        className="p-2.5 text-gray-500 hover:text-accent-gold hover:bg-accent-gold/10 rounded-xl transition-all"
                                                        title="Ubah Password Kasir"
                                                    >
                                                        <Key size={16} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteStaff(staff.id)}
                                                        className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Hapus Akun Kasir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-surface/50 border border-border/50 flex items-center justify-center text-accent-gold">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-300">Belum Ada Akun Kasir</h4>
                                            <p className="text-xs text-gray-500 mt-1">Buat akun untuk kasir/staf agar mereka bisa login dan mencatat transaksi.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Cashier Add Modal */}
            {isStaffModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in scale-in duration-200 relative">
                        {/* Background glowing circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 blur-3xl -mr-10 -mt-10" />

                        <div className="p-6 border-b border-border flex justify-between items-center relative z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="text-accent-gold" size={20} />
                                Tambah Akun Kasir
                            </h2>
                            <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddStaff} className="p-6 space-y-4 relative z-10">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Nama Lengkap Kasir</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: Budi Sudarsono"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                    value={staffForm.name}
                                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Alamat Email</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Contoh: budi@gmail.com"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white font-mono"
                                    value={staffForm.email}
                                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Password Akses</label>
                                    <input
                                        required
                                        type="password"
                                        placeholder="Min. 6 karakter"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                        value={staffForm.password}
                                        onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Konfirmasi Password</label>
                                    <input
                                        required
                                        type="password"
                                        placeholder="Ketik ulang"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                        value={staffForm.confirmPassword}
                                        onChange={e => setStaffForm({ ...staffForm, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStaffModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold text-sm text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingStaff}
                                    className="flex-1 px-4 py-3 rounded-xl bg-accent-gold text-black font-black hover:bg-white transition-all text-sm disabled:opacity-50"
                                >
                                    {isAddingStaff ? 'Menyimpan...' : 'Simpan Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cashier Reset Password Modal */}
            {isResetModalOpen && selectedStaffForReset && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in scale-in duration-200 relative">
                        {/* Background glowing circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 blur-3xl -mr-10 -mt-10" />

                        <div className="p-6 border-b border-border flex justify-between items-center relative z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Key className="text-accent-gold" size={20} />
                                Reset Password
                            </h2>
                            <button onClick={() => {
                                setIsResetModalOpen(false);
                                setSelectedStaffForReset(null);
                                setResetPassword('');
                            }} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-6 space-y-4 relative z-10">
                            <div className="p-3 bg-surface/50 border border-border rounded-xl">
                                <p className="text-xs text-gray-400 font-medium">Mereset password untuk kasir:</p>
                                <p className="text-sm font-bold text-accent-gold mt-1">{selectedStaffForReset.name}</p>
                                <p className="text-xs font-mono text-gray-500">{selectedStaffForReset.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Password Baru</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="Masukkan password baru kasir"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm text-white"
                                    value={resetPassword}
                                    onChange={e => setResetPassword(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetModalOpen(false);
                                        setSelectedStaffForReset(null);
                                        setResetPassword('');
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-surface transition-all font-bold text-sm text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResettingPassword}
                                    className="flex-1 px-4 py-3 rounded-xl bg-accent-gold text-black font-black hover:bg-white transition-all text-sm disabled:opacity-50"
                                >
                                    {isResettingPassword ? 'Mengubah...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? 'bg-surface text-foreground border border-border' : 'text-gray-500 hover:text-gray-300'}`}
        >
            {icon}
            {label}
        </button>
    );
}

interface FormInputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    required?: boolean;
}

function FormInput({ label, type = "text", value, onChange, disabled = false, required = false }: FormInputProps) {
    return (
        <div>
            <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
            <input
                type={type}
                disabled={disabled}
                required={required}
                className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-accent-gold transition-all text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
