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
    Info
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

    useEffect(() => {
        fetchSettings();
    }, []);

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
                    <TabButton
                        active={activeTab === 'notifications'}
                        onClick={() => setActiveTab('notifications')}
                        icon={<Bell size={18} />}
                        label="Notifikasi"
                    />
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

                        {activeTab === 'notifications' && (
                            <div className="h-40 flex flex-col items-center justify-center text-center">
                                <Bell className="text-gray-600 mb-3" size={32} />
                                <h4 className="font-bold text-gray-500">Fitur Segera Hadir</h4>
                                <p className="text-sm text-gray-600 mt-1">Kami sedang menyiapkan modul notifikasi untuk Anda.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
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
