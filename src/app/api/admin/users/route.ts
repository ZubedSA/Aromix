import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const owners = await prisma.user.findMany({
            where: { role: 'OWNER' },
            include: { store: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(owners);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
