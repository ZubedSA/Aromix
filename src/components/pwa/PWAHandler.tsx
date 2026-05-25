"use client";

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function PWAHandler() {
    const pathname = usePathname();
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    // 1. Registrasi Service Worker (Berjalan di semua halaman untuk offline caching)
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const registerSW = () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW Registered'))
                    .catch(err => console.log('SW Registration failed', err));
            };

            if (document.readyState === 'complete') {
                registerSW();
            } else {
                window.addEventListener('load', registerSW);
                return () => window.removeEventListener('load', registerSW);
            }
        }
    }, []);

    // 2. Tangkap Event (Sekali saja secara global)
    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // 3. Atur Visibilitas Pop-up Berdasarkan Halaman & Status Dismiss
    useEffect(() => {
        if (!installPrompt) return;

        const isDismissed = localStorage.getItem('aromix_pwa_dismissed') === 'true';
        const targetPages = ['/', '/login', '/register'];

        if (targetPages.includes(pathname || '') && !isDismissed) {
            // Jeda 2 detik sebelum memunculkan agar terkesan organik
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [pathname, installPrompt]);

    const handleInstall = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setInstallPrompt(null);
            setIsVisible(false);
            localStorage.setItem('aromix_pwa_dismissed', 'true');
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('aromix_pwa_dismissed', 'true');
    };

    // Hindari perenderan jika bukan di halaman target atau belum memenuhi syarat
    const targetPages = ['/', '/login', '/register'];
    if (!targetPages.includes(pathname || '') || !isVisible || !installPrompt) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="glass-panel p-6 rounded-[2rem] border-accent-gold/20 shadow-2xl relative overflow-hidden group">
                {/* Background Sparkle Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-gold/5 blur-3xl opacity-50"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex gap-4">
                    <div className="w-14 h-14 bg-accent-gold/10 rounded-2xl flex items-center justify-center border border-accent-gold/20 shrink-0 shadow-glass-gold">
                        <Smartphone className="text-accent-gold" size={24} />
                    </div>
                    <div className="pr-4">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">App Experience</span>
                            <Sparkles className="text-accent-gold" size={10} />
                        </div>
                        <h3 className="text-lg font-bold leading-tight mb-2">Instal AROMIX Premium</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Nikmati pengalaman kasir yang lebih cepat, lapor stok, dan akses instan langsung dari layar utama Anda.
                        </p>

                        <button
                            onClick={handleInstall}
                            className="w-full bg-foreground text-background py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-gold transition-all shadow-lg active:scale-95"
                        >
                            <Download size={16} />
                            Instal Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
