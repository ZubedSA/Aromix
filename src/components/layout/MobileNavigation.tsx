"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    Settings,
    Users,
    Briefcase,
    Database,
    LogOut,
    Menu,
    X,
    BarChart3,
    ShieldCheck,
    Droplet
} from 'lucide-react';

export default function MobileNavigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;
    const [mounted, setMounted] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Tutup drawer otomatis jika halaman berubah
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [pathname]);

    if (!mounted || !pathname || !pathname.startsWith('/dashboard')) return null;

    // 4 Item Utama Bottom Bar (Ergonomis 44px+)
    const primaryOwnerItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Kasir', icon: ShoppingCart, href: '/dashboard/pos' },
        { label: 'Produk', icon: Package, href: '/dashboard/products' },
    ];

    const primaryAdminItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard/admin' },
        { label: 'User', icon: Users, href: '/dashboard/admin/users' },
        { label: 'Backup', icon: Database, href: '/dashboard/admin/backup' },
    ];

    const primaryCashierItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Kasir', icon: ShoppingCart, href: '/dashboard/pos' },
        { label: 'Riwayat', icon: History, href: '/dashboard/transactions' },
    ];

    const mainItems = role === 'ADMIN' 
        ? primaryAdminItems 
        : role === 'CASHIER' 
            ? primaryCashierItems 
            : primaryOwnerItems;

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-2xl border-t border-border px-2 py-1.5 z-50 shadow-2xl">
                <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
                    {mainItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all ${
                                    isActive 
                                        ? 'text-accent-gold font-bold bg-accent-gold/10' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Tombol "Lainnya" untuk Drawer */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all ${
                            isDrawerOpen 
                                ? 'text-accent-gold font-bold bg-accent-gold/10' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Menu size={20} strokeWidth={isDrawerOpen ? 2.5 : 1.8} />
                        <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                            Menu
                        </span>
                    </button>
                </div>
            </nav>

            {/* Slide-Up Menu Drawer Modal (Mobile Native Bottom Sheet) */}
            {isDrawerOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Drawer Sheet */}
                    <div className="relative bg-surface border-t border-border rounded-t-3xl p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250">
                        {/* Pull Indicator */}
                        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 opacity-60" />

                        <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-gold/10 border border-accent-gold/20 rounded-xl">
                                    <Droplet className="text-accent-gold" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Menu AROMIX</h3>
                                    <p className="text-xs text-gray-400">Pilih modul yang ingin diakses</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-background rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {role !== 'ADMIN' && (
                                <>
                                    <DrawerCard
                                        href="/dashboard/transactions"
                                        icon={<History size={20} className="text-accent-gold" />}
                                        title="Riwayat Transaksi"
                                        desc="Lihat & cetak nota"
                                        active={pathname === '/dashboard/transactions'}
                                        onClick={() => setIsDrawerOpen(false)}
                                    />
                                    <DrawerCard
                                        href="/dashboard/reports"
                                        icon={<BarChart3 size={20} className="text-blue-400" />}
                                        title="Laporan & Omzet"
                                        desc="Analitik penjualan"
                                        active={pathname === '/dashboard/reports'}
                                        onClick={() => setIsDrawerOpen(false)}
                                    />
                                    {role === 'OWNER' && (
                                        <>
                                            <DrawerCard
                                                href="/dashboard/ingredients"
                                                icon={<Briefcase size={20} className="text-emerald-400" />}
                                                title="Stok & Inventory"
                                                desc="Bahan baku & botol"
                                                active={pathname === '/dashboard/ingredients'}
                                                onClick={() => setIsDrawerOpen(false)}
                                            />
                                            <DrawerCard
                                                href="/dashboard/customers"
                                                icon={<Users size={20} className="text-purple-400" />}
                                                title="Pelanggan"
                                                desc="Database pembeli"
                                                active={pathname === '/dashboard/customers'}
                                                onClick={() => setIsDrawerOpen(false)}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {role === 'ADMIN' && (
                                <>
                                    <DrawerCard
                                        href="/dashboard/admin/stats"
                                        icon={<BarChart3 size={20} className="text-accent-gold" />}
                                        title="Statistik Global"
                                        desc="Ringkasan platform"
                                        active={pathname === '/dashboard/admin/stats'}
                                        onClick={() => setIsDrawerOpen(false)}
                                    />
                                    <DrawerCard
                                        href="/dashboard/admin/users"
                                        icon={<ShieldCheck size={20} className="text-blue-400" />}
                                        title="Manajemen User"
                                        desc="Kelola pemilik toko"
                                        active={pathname === '/dashboard/admin/users'}
                                        onClick={() => setIsDrawerOpen(false)}
                                    />
                                </>
                            )}

                            {role !== 'CASHIER' && (
                                <DrawerCard
                                    href="/dashboard/settings"
                                    icon={<Settings size={20} className="text-amber-400" />}
                                    title="Pengaturan"
                                    desc="Profil toko & cetakan"
                                    active={pathname === '/dashboard/settings'}
                                    onClick={() => setIsDrawerOpen(false)}
                                />
                            )}
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={() => {
                                setIsDrawerOpen(false);
                                signOut({ callbackUrl: '/login' });
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-2xl font-bold text-sm transition-all min-h-[48px]"
                        >
                            <LogOut size={18} />
                            <span>Keluar dari Aplikasi</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

function DrawerCard({ 
    href, 
    icon, 
    title, 
    desc, 
    active, 
    onClick 
}: { 
    href: string; 
    icon: React.ReactNode; 
    title: string; 
    desc: string; 
    active: boolean; 
    onClick: () => void 
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[85px] ${
                active
                    ? 'bg-accent-gold/10 border-accent-gold/40 text-white'
                    : 'bg-background/60 border-border hover:border-border/80 text-gray-300'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-surface border border-border/50">
                    {icon}
                </div>
            </div>
            <div>
                <p className="font-bold text-xs text-white leading-tight mt-2">{title}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{desc}</p>
            </div>
        </Link>
    );
}
