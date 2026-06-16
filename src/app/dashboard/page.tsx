"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    BarChart3,
    Package,
    ShoppingCart,
    Users,
    Settings,
    AlertCircle,
    TrendingUp,
    Droplets,
    Plus,
    Bell,
    User,
    Calendar,
    ChevronRight,
    Search,
    History,
    FileText,
    FlaskConical,
    ShoppingBag,
    Lock,
    LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            router.replace('/dashboard/admin');
            return;
        }
        fetchStats();
    }, [session, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-gray-400 gap-4">
            <div className="w-12 h-12 border-2 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest animate-pulse">AROMIX System</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-28 md:pb-10">
            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden block">
                <header className="px-6 pt-10 pb-20 bg-gradient-to-b from-accent-gold/10 to-transparent flex justify-between items-center">
                    <h1 className="text-2xl font-black italic premium-gradient-text tracking-tighter uppercase break-words overflow-hidden text-ellipsis max-w-[180px]">
                        {session?.user?.storeName || 'AROMIX'}
                    </h1>
                    <div className="flex gap-4">
                        <button className="relative p-2 bg-surface border border-border rounded-xl">
                            <Bell size={20} className="text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-gold rounded-full" />
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                                className="p-2 bg-surface border border-border rounded-xl hover:border-accent-gold/50 transition-all"
                            >
                                <User size={20} className={isMobileDropdownOpen ? "text-accent-gold" : "text-gray-400"} />
                            </button>
                            {isMobileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMobileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-surface/95 backdrop-blur-md border border-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {session?.user?.role !== 'CASHIER' && (
                                            <>
                                                <Link 
                                                    href="/dashboard/settings" 
                                                    onClick={() => setIsMobileDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all"
                                                >
                                                    <User size={16} className="text-accent-gold" />
                                                    <span className="font-medium">Profil</span>
                                                </Link>
                                                <Link 
                                                    href="/dashboard/settings?tab=security" 
                                                    onClick={() => setIsMobileDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all"
                                                >
                                                    <Lock size={16} className="text-accent-gold" />
                                                    <span className="font-medium">Ubah Password</span>
                                                </Link>
                                                <hr className="border-border my-1" />
                                            </>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setIsMobileDropdownOpen(false);
                                                signOut({ callbackUrl: '/login' });
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all text-left"
                                        >
                                            <LogOut size={16} />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="px-6 -mt-12 space-y-6">
                    {/* Quick Info Bar */}
                    <div className="glass-panel p-4 rounded-3xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-gold/10 rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} className="text-accent-gold" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">Omzet Hari Ini</span>
                        </div>
                        <Link href="/dashboard/pos" className="bg-accent-gold text-black px-6 py-2.5 rounded-2xl font-black text-xs shadow-glass-gold">
                            TRANSAKSI
                        </Link>
                    </div>

                    {/* Featured Status Card */}
                    <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 blur-3xl -mr-10 -mt-10" />

                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-accent-gold">{new Date().getDate()}</span>
                                <div className="text-sm uppercase font-bold tracking-widest text-gray-500">
                                    <div>{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                                    <div className="text-gray-400">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
                                </div>
                            </div>
                            <button className="p-3 bg-surface border border-border rounded-full hover:bg-accent-gold hover:text-black transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Status Pekan Ini</p>
                            <div className="flex justify-between items-center">
                                {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-600">{day}</span>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold ${i === new Date().getDay() - 1
                                            ? 'bg-accent-gold text-black border-accent-gold'
                                            : 'border-border text-gray-500'
                                            }`}>
                                            {i < new Date().getDay() ? '✓' : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Circular Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <CircularStat
                            value={stats?.transactionCount || 0}
                            label="Transaksi"
                            color="border-accent-gold"
                        />
                        <CircularStat
                            value={stats?.lowStockIngredients?.length || 0}
                            label="Stok Low"
                            color="border-red-500"
                        />
                        <CircularStat
                            value={`Rp ${((stats?.labaToday || 0) / 1000).toFixed(0)}k`}
                            label="Laba"
                            color="border-accent-emerald"
                        />
                    </div>

                    {/* Quick Tools Grid */}
                    <div className="grid grid-cols-2 gap-3 py-4">
                        <ToolItem icon={ShoppingCart} label="Kasir / POS" href="/dashboard/pos" />
                        <ToolItem icon={History} label="Riwayat & Laporan" href="/dashboard/transactions" />
                        {session?.user?.role !== 'CASHIER' && (
                            <>
                                <ToolItem icon={Package} label="Produk & Katalog" href="/dashboard/products" />
                                <ToolItem icon={Droplets} label="Inventory / Stok" href="/dashboard/ingredients" />
                                <ToolItem icon={Users} label="Pelanggan & Staff" href="/dashboard/customers" />
                                <ToolItem icon={Settings} label="Pengaturan" href="/dashboard/settings" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:block p-6 md:p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold premium-gradient-text tracking-tighter uppercase italic">
                            {session?.user?.storeName || 'AROMIX'}
                        </h1>
                        <p className="text-gray-400 mt-1">Dashboard Ringkasan Operasional</p>
                    </div>
                    <div className="flex gap-4 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
                                className="bg-surface border border-border px-4 py-2 rounded-full hover:border-accent-gold/50 transition-all flex items-center gap-2"
                            >
                                <User size={18} className={isDesktopDropdownOpen ? "text-accent-gold" : "text-gray-400"} />
                                <span className={isDesktopDropdownOpen ? "text-accent-gold" : "text-white"}>Profile</span>
                            </button>
                            {isDesktopDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDesktopDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-surface/95 backdrop-blur-md border border-border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                            Menu Akun
                                        </div>
                                        {session?.user?.role !== 'CASHIER' && (
                                            <>
                                                <Link 
                                                    href="/dashboard/settings" 
                                                    onClick={() => setIsDesktopDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all"
                                                >
                                                    <User size={16} className="text-accent-gold" />
                                                    <span className="font-medium">Profil Toko</span>
                                                </Link>
                                                <Link 
                                                    href="/dashboard/settings?tab=security" 
                                                    onClick={() => setIsDesktopDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-accent-gold/10 transition-all"
                                                >
                                                    <Lock size={16} className="text-accent-gold" />
                                                    <span className="font-medium">Ubah Password</span>
                                                </Link>
                                                <hr className="border-border my-1" />
                                            </>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setIsDesktopDropdownOpen(false);
                                                signOut({ callbackUrl: '/login' });
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all text-left"
                                        >
                                            <LogOut size={16} />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Quick Tools for Desktop */}
                <div className="mb-12">
                    <SectionHeader title="Aksi Cepat" />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <ToolItem icon={ShoppingCart} label="Kasir / POS" href="/dashboard/pos" />
                        <ToolItem icon={History} label="Riwayat & Laporan" href="/dashboard/transactions" />
                        {session?.user?.role !== 'CASHIER' && (
                            <>
                                <ToolItem icon={Package} label="Produk & Katalog" href="/dashboard/products" />
                                <ToolItem icon={Droplets} label="Inventory / Stok" href="/dashboard/ingredients" />
                                <ToolItem icon={Users} label="Pelanggan & Staff" href="/dashboard/customers" />
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Penjualan Hari Ini"
                        value={`Rp ${stats?.salesToday?.toLocaleString('id-ID') || 0}`}
                        icon={<TrendingUp className="text-accent-emerald" />}
                        trend="Total Omzet"
                    />
                    <StatCard
                        title="Laba Hari Ini"
                        value={`Rp ${stats?.labaToday?.toLocaleString('id-ID') || 0}`}
                        icon={<TrendingUp className="text-accent-gold" />}
                        trend="Keuntungan Bersih"
                    />
                    <StatCard
                        title="Total Transaksi"
                        value={stats?.transactionCount || 0}
                        icon={<ShoppingCart className="text-blue-400" />}
                        trend="Hari ini"
                    />
                    <StatCard
                        title="Bahan Stok Rendah"
                        value={`${stats?.lowStockIngredients?.length || 0} Item`}
                        icon={<Droplets className="text-red-500" />}
                        trend="Segera periksa"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <SectionHeader title="Aktivitas Penjualan" />
                        <div className="glass-panel rounded-2xl p-6 h-80">
                            {stats?.salesTrend && stats.salesTrend.length > 0 ? (
                                <SalesChart data={stats.salesTrend} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    Belum ada data penjualan
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <SectionHeader title="Produk Terlaris" />
                        <div className="glass-panel rounded-2xl p-6 space-y-4">
                            {stats?.topProducts?.length > 0 ? (
                                stats.topProducts.map((p: any, idx: number) => (
                                    <BestSellerItem key={idx} rank={idx + 1} name={p.name} sold={p.totalSold} />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center">Belum ada data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- COMPONENTS --- */

function CircularStat({ value, label, color }: { value: any, label: string, color: string }) {
    return (
        <div className="glass-panel p-2 sm:p-4 rounded-[2rem] flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full border-4 ${color} flex items-center justify-center`}>
                <span className="text-sm font-black">{value}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
    );
}

function ToolItem({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-surface/30 rounded-[2rem] border border-border/50 hover:bg-accent-gold/10 hover:border-accent-gold/20 transition-all group">
            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:border-accent-gold/50 transition-all">
                <Icon size={20} className="text-gray-500 group-hover:text-accent-gold" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-white text-center">{label}</span>
        </Link>
    );
}

function SidebarLinkForDashboard({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-surface/30 rounded-[2rem] border border-border/50 hover:bg-accent-gold/10 hover:border-accent-gold/20 transition-all group">
            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:border-accent-gold/50 transition-all">
                <Icon size={20} className="text-gray-500 group-hover:text-accent-gold" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-white text-center">{label}</span>
        </Link>
    );
}

function StatCard({ title, value, icon, trend }: any) {
    return (
        <div className="glass-panel p-6 rounded-2xl hover:border-accent-gold/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-background rounded-xl border border-border">
                    {icon}
                </div>
                <span className="text-xs text-gray-500">{trend}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button className="text-sm text-accent-gold hover:underline">Lihat Semua</button>
        </div>
    );
}

function BestSellerItem({ rank, name, sold }: { rank: number, name: string, sold: number }) {
    const medals = ['🥇', '🥈', '🥉'];
    return (
        <div className="flex items-center gap-3">
            <span className="text-lg w-8 text-center">
                {rank <= 3 ? medals[rank - 1] : <span className="text-xs text-gray-500 font-bold">#{rank}</span>}
            </span>
            <span className="text-gray-300 flex-1 truncate text-sm">{name}</span>
            <span className="font-bold text-accent-emerald text-sm whitespace-nowrap">{sold} terjual</span>
        </div>
    );
}

function SalesChart({ data }: { data: { date: string; label: string; total: number; count: number }[] }) {
    const maxTotal = Math.max(...data.map(d => d.total), 1);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const barMaxHeight = 180; // px

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">7 Hari Terakhir</p>
                <p className="text-xs text-gray-500">
                    Total: <span className="text-accent-gold font-bold">Rp {data.reduce((s, d) => s + d.total, 0).toLocaleString('id-ID')}</span>
                </p>
            </div>
            <div className="flex-1 flex items-end gap-3 px-2">
                {data.map((d, i) => {
                    const ratio = maxTotal > 0 ? d.total / maxTotal : 0;
                    const barHeight = animated ? Math.max(ratio * barMaxHeight, d.total > 0 ? 12 : 4) : 4;
                    const isToday = i === data.length - 1;
                    return (
                        <div key={d.date} className="flex-1 flex flex-col items-center justify-end group cursor-pointer" 
                             title={`${d.label}: Rp ${d.total.toLocaleString('id-ID')} (${d.count} transaksi)`}>
                            {/* Value label */}
                            <div className={`text-[10px] font-bold mb-1 transition-all duration-700 ${
                                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                            } ${d.total > 0 ? (isToday ? 'text-accent-gold' : 'text-gray-400') : 'text-gray-600'}`}
                                 style={{ transitionDelay: `${i * 100 + 300}ms` }}>
                                {d.total > 0 ? `${(d.total / 1000).toFixed(0)}k` : '-'}
                            </div>
                            {/* Bar */}
                            <div
                                className={`w-full max-w-[44px] rounded-t-xl ${
                                    isToday 
                                        ? 'bg-gradient-to-t from-accent-gold/70 via-accent-gold to-accent-gold shadow-[0_-4px_20px_rgba(212,175,55,0.25)]' 
                                        : d.total > 0
                                            ? 'bg-gradient-to-t from-gray-700 via-gray-600 to-gray-500 group-hover:from-accent-gold/30 group-hover:via-accent-gold/20 group-hover:to-accent-gold/10'
                                            : 'bg-gray-800/50'
                                }`}
                                style={{ 
                                    height: `${barHeight}px`,
                                    transition: `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100}ms`,
                                }}
                            />
                            {/* Label */}
                            <span className={`text-[10px] font-bold mt-2 ${isToday ? 'text-accent-gold' : 'text-gray-500'}`}>
                                {d.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
