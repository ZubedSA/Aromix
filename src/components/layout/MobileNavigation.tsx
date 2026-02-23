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
    User,
    PlusCircle,
    Users
} from 'lucide-react';

export default function MobileNavigation() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const ownerItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Transaksi', icon: ShoppingCart, href: '/dashboard/pos' },
        { label: 'Stok', icon: Package, href: '/dashboard/ingredients' },
        { label: 'Riwayat', icon: History, href: '/dashboard/transactions' },
        { label: 'Profil', icon: User, href: '/dashboard/profile' },
    ];

    const adminItems = [
        { label: 'Home', icon: LayoutDashboard, href: '/dashboard/admin' },
        { label: 'Users', icon: Users, href: '/dashboard/admin/users' },
        { label: 'Profil', icon: User, href: '/dashboard/profile' },
    ];

    const navItems = role === 'ADMIN' ? adminItems : ownerItems;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 z-50 flex justify-between items-center shadow-2xl">
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
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
