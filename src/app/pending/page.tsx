"use client";

import React from 'react';
import { Clock, ShieldCheck, LogOut, MessageCircle } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function PendingPage() {
    const { data: session } = useSession();
    const storeName = session?.user?.storeName || 'Toko Baru';
    const userName = session?.user?.name || 'Mitra';

    const handleWhatsApp = () => {
        const message = `Halo Admin AROMIX, saya *${userName}* pengelola *${storeName}*. Saya baru saja mendaftar dan ingin request aktivasi akun segera agar bisa mulai menggunakan sistem. Mohon bantuannya, terima kasih!`;
        const whatsappUrl = `https://wa.me/6281717594886?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="glass-panel max-w-lg w-full p-10 rounded-3xl text-center space-y-8 animate-scale-in">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/20">
                        <Clock size={48} className="text-accent-gold animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border border-border shadow-lg">
                        <ShieldCheck size={20} className="text-accent-gold" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold premium-gradient-text tracking-tight">Akun Sedang Ditinjau</h1>
                    <p className="text-gray-400 leading-relaxed">
                        Terima kasih telah mendaftar di <strong>AROMIX</strong>. Pendaftaran Anda sedang kami tinjau secara manual untuk memastikan keamanan sistem.
                    </p>
                    <div className="p-4 bg-surface/50 rounded-2xl border border-border/50 text-sm text-gray-400">
                        Proses peninjauan biasanya memakan waktu <span className="text-accent-gold font-bold">1-24 jam</span>. Kami akan segera mengaktifkan akses Anda.
                    </div>

                    <button
                        onClick={handleWhatsApp}
                        className="w-full mt-4 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-glass"
                    >
                        <MessageCircle size={22} />
                        Butuh Akses Cepat? Hubungi Admin
                    </button>
                </div>

                <div className="pt-6">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-2 mx-auto text-gray-500 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        Keluar dari sistem
                    </button>
                </div>
            </div>
        </div>
    );
}
