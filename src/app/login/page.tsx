"use client";

import React, { useState } from 'react';
import { Crown, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (res?.error) {
                setError('Email atau password salah.');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-gold/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-emerald/5 blur-[100px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-surface border border-border rounded-3xl mb-6 shadow-2xl">
                        <Crown className="text-accent-gold" size={40} />
                    </div>
                    <h1 className="text-3xl font-black premium-gradient-text tracking-tighter">Selamat Datang Kembali</h1>
                    <p className="text-gray-400 mt-2">Masuk ke Dashboard AROMIX Anda</p>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Toko</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 focus:border-accent-gold outline-none transition-all placeholder:text-gray-600"
                                    placeholder="owner@aromix.id"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 focus:border-accent-gold outline-none transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full bg-foreground text-background font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-gold transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Masuk Sekarang
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-sm">
                            Belum punya akun? <Link href="/register" className="text-accent-gold font-bold hover:underline">Daftar Toko Baru</Link>
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                    AROMIX Enterprise System &copy; 2026
                </p>
            </div>
        </div>
    );
}
