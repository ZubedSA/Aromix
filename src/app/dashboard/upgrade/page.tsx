"use client";

import React from 'react';
import { Crown, CheckCircle2, Zap, Rocket, ShieldCheck } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function UpgradePage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-block p-3 bg-accent-gold/10 rounded-2xl mb-4">
                        <Crown className="text-accent-gold" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold premium-gradient-text mb-4">Akses Anda Terbatas</h1>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Masa langganan toko Anda telah berakhir. Silakan pilih paket di bawah ini untuk mengaktifkan kembali fitur POS, Inventaris, dan Laporan.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Silver Plan */}
                    <PricingCard
                        name="Silver"
                        price="Rp 150.000"
                        period="/bulan"
                        features={[
                            "Hingga 2 Akun Kasir",
                            "Manajemen Inventaris Dasar",
                            "Laporan Penjualan Harian",
                            "Support Email"
                        ]}
                        icon={<Zap className="text-gray-400" />}
                    />

                    {/* Gold Plan (Recommended) */}
                    <PricingCard
                        name="Gold Premium"
                        price="Rp 350.000"
                        period="/bulan"
                        features={[
                            "Akun Kasir Tanpa Batas",
                            "Formula Builder Pro",
                            "Grafik Analistik Real-time",
                            "Akses PWA Offline",
                            "Priority 24/7 Support"
                        ]}
                        highlight
                        icon={<Rocket className="text-accent-gold" />}
                    />
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                        <ShieldCheck size={18} />
                        Kembali ke Login
                    </button>
                </div>
            </div>
        </div>
    );
}

function PricingCard({ name, price, period, features, highlight = false, icon }: any) {
    return (
        <div className={`glass-panel p-8 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] ${highlight ? 'border-accent-gold shadow-[0_0_40px_-10px_rgba(197,160,89,0.3)]' : 'border-border'}`}>
            {highlight && (
                <div className="absolute top-0 right-0 bg-accent-gold text-background text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                    Paling Populer
                </div>
            )}
            <div className="mb-6">
                <div className="mb-2">{icon}</div>
                <h3 className="text-xl font-bold">{name}</h3>
            </div>
            <div className="mb-8">
                <span className="text-4xl font-black">{price}</span>
                <span className="text-gray-500 text-sm">{period}</span>
            </div>
            <ul className="space-y-4 mb-10">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 size={16} className={highlight ? 'text-accent-gold' : 'text-accent-emerald'} />
                        {f}
                    </li>
                ))}
            </ul>
            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${highlight ? 'bg-accent-gold text-black shadow-lg shadow-accent-gold/20 hover:bg-white' : 'bg-surface border border-border hover:border-accent-gold'}`}>
                Pilih Paket {name}
            </button>
        </div>
    );
}
