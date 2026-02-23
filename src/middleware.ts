import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    // 1. Authentication Check
    if (!token && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // 2. Role-Based Access Control (RBAC)
    const role = token?.role as string;

    // Admin Routes protection
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Owner Routes protection
    if (pathname.startsWith('/dashboard/owner') && !['ADMIN', 'OWNER'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 3. Approval Check (Only for Owners/Cashiers, Admin is always approved)
    const isApproved = token?.isApproved as boolean;
    const isPendingPage = pathname.startsWith('/pending');

    if (
        pathname.startsWith('/dashboard') &&
        !isPendingPage &&
        role !== 'ADMIN' &&
        !isApproved
    ) {
        return NextResponse.redirect(new URL('/pending', req.url));
    }

    // Prevent accessing pending page if approved
    if (isPendingPage && isApproved) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 4. Subscription Check
    const subStatus = token?.subscriptionStatus as string;
    const isUpgradePage = pathname.startsWith('/dashboard/upgrade');

    if (
        pathname.startsWith('/dashboard') &&
        !isUpgradePage &&
        !isPendingPage &&
        subStatus === 'EXPIRED' &&
        role !== 'ADMIN'
    ) {
        return NextResponse.redirect(new URL('/dashboard/upgrade', req.url));
    }

    // Prevent accessing upgrade page if NOT expired
    if (isUpgradePage && subStatus === 'ACTIVE' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/admin/:path*', '/api/owner/:path*'],
};
