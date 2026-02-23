import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        console.log('[DEBUG] PING START');
        const count = await prisma.user.count();
        console.log('[DEBUG] PING SUCCESS, count:', count);
        return NextResponse.json({ success: true, count });
    } catch (e: any) {
        console.error('[DEBUG] PING FAILED:', e.message);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
