import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const firstUser = await prisma.user.findFirst({
            select: { email: true, role: true }
        });

        return NextResponse.json({
            success: true,
            totalUsers: userCount,
            sampleUser: firstUser ? { email: firstUser.email, role: firstUser.role } : 'No user found'
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
