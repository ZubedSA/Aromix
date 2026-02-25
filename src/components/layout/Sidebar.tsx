"use client";

import React from 'react';
import {
    BarChart3,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Briefcase,
    LogOut,
    Droplet,
    ShieldCheck,
    LayoutDashboard,
    History as HistoryIcon,
    Beaker,
    ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const role = session?.user?.role;

    return (
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 glass-panel border-r-0 border-b-0 border-t-0 p-4 flex-col transition-all z-20">
            {/* Brand */}
            <div className="flex items-center gap-3 px-3 py-6 mb-8">
                <div className="bg-accent-gold p-2 rounded-xl shadow-glass-gold">
                    <Droplet className="text-black" size={24} />
                </div>
                <span className="text-xl font-bold premium-gradient-text hidden md:block truncate max-w-[150px]">
                    {role === 'ADMIN' ? 'AROMIX Admin' : (session?.user?.storeName || 'AROMIX')}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {/* Global Stats - Shared/Admin */}
                {role === 'ADMIN' ? (
                    <>
                        <SidebarLink
                            icon={<ShieldCheck size={20} />}
                            label="Pusat Kendali"
                            href="/dashboard/admin"
                            active={pathname === '/dashboard/admin'}
                        />
                        <SidebarLink
                            icon={<BarChart3 size={20} />}
                            label="Statistik Global"
                            href="/dashboard/admin/stats"
                            active={pathname === '/dashboard/admin/stats'}
                        />
                    </>
                ) : (
                    <SidebarLink
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        href="/dashboard"
                        active={pathname === '/dashboard'}
                    />
                )}

                {/* Operations - Owner & Cashier Only */}
                {role !== 'ADMIN' && (
                    <>
                        <SidebarLink
                            icon={<ShoppingCart size={20} />}
                            label="Kasir / POS"
                            href="/dashboard/pos"
                            active={pathname === '/dashboard/pos'}
                        />
                        <SidebarLink
                            icon={<HistoryIcon size={20} />}
                            label="Riwayat & Laporan"
                            href="/dashboard/transactions"
                            active={pathname === '/dashboard/transactions' || pathname === '/dashboard/reports'}
                        />
                        <SidebarLink
                            icon={<Package size={20} />}
                            label="Produk & Katalog"
                            href="/dashboard/products"
                            active={pathname === '/dashboard/products' || pathname === '/dashboard/menu' || pathname === '/dashboard/formulas'}
                        />
                        <SidebarLink
                            icon={<Briefcase size={20} />}
                            label="Inventory / Stok"
                            href="/dashboard/ingredients"
                            active={pathname === '/dashboard/ingredients' || pathname === '/dashboard/suppliers'}
                        />
                        {role === 'OWNER' && (
                            <SidebarLink
                                icon={<Users size={20} />}
                                label="Pelanggan & Staff"
                                href="/dashboard/customers"
                                active={pathname === '/dashboard/customers' || pathname === '/dashboard/staff'}
                            />
                        )}
                    </>
                )}

                {/* Management - Admin Only */}
                {role === 'ADMIN' && (
                    <SidebarLink
                        icon={<Users size={20} />}
                        label="Manajemen User"
                        href="/dashboard/admin/users"
                        active={pathname === "/dashboard/admin/users"}
                    />
                )}
            </nav>

            {/* Footer Nav */}
            <div className="pt-4 border-t border-border space-y-2">
                <SidebarLink
                    icon={<Settings size={20} />}
                    label="Pengaturan"
                    href="/dashboard/settings"
                    active={pathname === '/dashboard/settings'}
                />
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="hidden md:block">Keluar</span>
                </button>
            </div>
        </aside>
    );
}

function SidebarLink({ icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-foreground text-background font-semibold shadow-premium'
                : 'text-gray-400 hover:bg-surface/50 hover:text-foreground'
                }`}
        >
            {icon}
            <span className="hidden md:block">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-gold md:block hidden" />}
        </Link>
    );
}
