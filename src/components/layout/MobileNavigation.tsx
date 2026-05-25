"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    Settings,
    Users,
    Briefcase,
    Database
} from 'lucide-react';

export default function MobileNavigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const ownerItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Kasir', icon: ShoppingCart, href: '/dashboard/pos' },
        { label: 'Produk', icon: Package, href: '/dashboard/products' },
        { label: 'Stok', icon: Briefcase, href: '/dashboard/ingredients' },
        { label: 'Pelanggan', icon: Users, href: '/dashboard/customers' },
        { label: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
    ];

    const adminItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard/admin' },
        { label: 'Users', icon: Users, href: '/dashboard/admin/users' },
        { label: 'Backup', icon: Database, href: '/dashboard/admin/backup' },
        { label: 'Pengaturan', icon: Settings, href: '/dashboard/settings' },
    ];

    const cashierItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Kasir', icon: ShoppingCart, href: '/dashboard/pos' },
        { label: 'Riwayat', icon: History, href: '/dashboard/transactions' },
    ];

    const navItems = role === 'ADMIN' 
        ? adminItems 
        : role === 'CASHIER' 
            ? cashierItems 
            : ownerItems;

    // Hanya tampilkan navigasi di halaman dashboard jika sudah terpasang (mounted) di client
    if (!mounted || !pathname || !pathname.startsWith('/dashboard')) return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/5 px-3 py-2.5 z-50 flex justify-between items-center shadow-2xl">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-accent-gold scale-110' : 'text-gray-500'
                            }`}
                    >
                        <div className={`p-1 rounded-xl ${isActive ? 'bg-accent-gold/10' : ''}`}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
