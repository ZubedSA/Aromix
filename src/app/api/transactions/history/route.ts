import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
        where: { storeId: session.user.storeId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return NextResponse.json(transactions);
}
