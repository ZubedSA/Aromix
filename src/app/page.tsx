"use client";

import Link from 'next/link';
import { Crown, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Nav */}
            <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Crown className="text-accent-gold" size={32} />
                    <span className="text-2xl font-black tracking-tighter">AROMIX</span>
                </div>
                <Link href="/login" className="bg-surface border border-border px-6 py-2 rounded-full font-bold hover:border-accent-gold transition-all">
                    Masuk
                </Link>
            </nav>

            {/* Hero */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-40 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-4 py-1.5 bg-accent-gold/10 text-accent-gold rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                        Solusi SaaS Parfum Premium #1
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 premium-gradient-text leading-[1.1]">
                        Kelola Bisnis Parfum<br />Tanpa Ribet.
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
                        Dari racikan formula hingga kasir modern, AROMIX membantu UMKM parfum tampil profesional dan berskala nasional.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/login" className="group bg-foreground text-background px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-accent-gold transition-all">
                            Mulai Sekarang Gratis
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-8 py-4 rounded-2xl font-bold text-lg text-gray-400 hover:text-white transition-colors">
                            Lihat Demo
                        </button>
                    </div>
                </motion.div>

                {/* Features Preview */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <FeatureCard
                        icon={<ShieldCheck className="text-accent-gold" />}
                        title="Aman & Multi-tenant"
                        desc="Data toko Anda terisolasi sempurna dengan keamanan tingkat fintech."
                    />
                    <FeatureCard
                        icon={<Zap className="text-accent-emerald" />}
                        title="Formula Pro Builder"
                        desc="Hitung stok bahan otomatis berdasarkan racikan parfum unik Anda."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="text-blue-400" />}
                        title="Laporan Real-time"
                        desc="Pantau penjualan harian dari mana saja melalui Dashboard premium."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="p-10 border-t border-border text-center text-gray-500 text-sm">
                &copy; 2026 AROMIX Premium SaaS. Made with Excellence.
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="glass-panel p-8 rounded-3xl hover:border-accent-gold/20 transition-all group">
            <div className="mb-6 p-3 bg-background border border-border rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}
