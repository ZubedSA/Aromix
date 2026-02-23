"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Droplet, Mail, Lock, User, Briefcase, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        storeName: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/login"), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Gagal mendaftar");
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-accent-emerald/10 text-accent-emerald rounded-full flex items-center justify-center mb-6 border border-accent-emerald/20 animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Registrasi Berhasil!</h1>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    Akun Anda telah dibuat. Silakan login untuk melanjutkan ke proses peninjauan.
                </p>
                <div className="flex items-center gap-2 text-accent-gold">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mengalihkan ke halaman login...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black items-center justify-center p-20">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1978&auto=format&fit=crop')] bg-cover bg-center grayscale" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/80 to-transparent" />

                <div className="relative z-10 space-y-8 max-w-md">
                    <div className="flex items-center gap-4 mb-20 animate-fade-in">
                        <div className="bg-accent-gold p-3 rounded-2xl shadow-glass-gold">
                            <Droplet className="text-black" size={32} />
                        </div>
                        <span className="text-4xl font-black italic tracking-tighter premium-gradient-text uppercase">AROMIX</span>
                    </div>

                    <h2 className="text-5xl font-bold leading-tight animate-slide-up">
                        Kembangkan Bisnis <br />
                        <span className="text-accent-gold">Parfum Premium</span> Anda.
                    </h2>
                    <p className="text-xl text-gray-400 font-light animate-slide-up animation-delay-200">
                        Manajemen stok pintar, formula eksklusif, dan laporan penjualan dalam satu dashboard elegan.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 overflow-y-auto">
                <div className="max-w-md w-full animate-fade-in animation-delay-300">
                    <div className="mb-10 lg:hidden flex flex-col items-center text-center">
                        <div className="bg-accent-gold p-2.5 rounded-xl mb-4">
                            <Droplet className="text-black" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold italic premium-gradient-text uppercase tracking-tighter">AROMIX</h1>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-3xl font-bold mb-2">Buat Akun Baru</h3>
                        <p className="text-gray-400">Daftarkan toko parfum Anda hari ini.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nama Brand Toko</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-gold transition-colors" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: Aromix Fragrance"
                                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                                    value={formData.storeName}
                                    onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nama Pemilik</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-gold transition-colors" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Nama Lengkap Anda"
                                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Bisnis</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-gold transition-colors" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="email@bisnis.com"
                                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent-gold transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="Min. 8 Karakter"
                                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent-gold transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-gold transform hover:scale-[1.02] transition-all disabled:opacity-50 shadow-glass"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin text-background" />
                            ) : (
                                <>
                                    DAFTAR SEKARANG
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-gray-500 text-sm">
                        Sudah punya akun? <Link href="/login" className="text-accent-gold font-bold hover:underline">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
