"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Droplet, User, Settings, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function MobileHeader() {
    const { data: session } = useSession();
    const role = session?.user?.role;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-b border-border px-4 flex items-center justify-between z-40 shadow-sm">
            {/* Brand Logo & Store Name */}
            <Link href={role === 'ADMIN' ? '/dashboard/admin' : '/dashboard'} className="flex items-center gap-2.5">
                <div className="bg-accent-gold p-2 rounded-xl shadow-glass-gold flex items-center justify-center">
                    <Droplet className="text-black" size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-black italic tracking-tight premium-gradient-text uppercase leading-none truncate max-w-[160px]">
                        {role === 'ADMIN' ? 'AROMIX Admin' : (session?.user?.storeName || 'AROMIX')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                        {role === 'ADMIN' ? 'Super Admin' : role === 'CASHIER' ? 'Kasir Toko' : 'Pemilik Toko'}
                    </span>
                </div>
            </Link>

            {/* User Profile Quick Action */}
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-1.5 p-2 bg-background/60 border border-border rounded-xl hover:border-accent-gold/50 transition-all text-xs font-semibold"
                    aria-label="Menu Pengguna"
                >
                    <div className="w-6 h-6 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center font-bold text-xs">
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={14} />}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-accent-gold' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2 border-b border-border/50 mb-1">
                                <p className="text-xs font-bold text-white truncate">{session?.user?.name || 'User'}</p>
                                <p className="text-[10px] text-gray-400 truncate">{session?.user?.email || ''}</p>
                            </div>

                            {role !== 'CASHIER' && (
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all font-medium"
                                >
                                    <Settings size={16} className="text-accent-gold" />
                                    <span>Pengaturan Akun</span>
                                </Link>
                            )}

                            {role === 'ADMIN' && (
                                <Link
                                    href="/dashboard/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all font-medium"
                                >
                                    <ShieldCheck size={16} className="text-accent-gold" />
                                    <span>Pusat Kendali Admin</span>
                                </Link>
                            )}

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    signOut({ callbackUrl: '/login' });
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all font-medium text-left mt-1"
                            >
                                <LogOut size={16} />
                                <span>Keluar Aplikasi</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
