import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { days } = await req.json();

        // 1. Find user to get storeId
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: { store: { include: { subscription: true } } }
        });

        if (!user || !user.storeId) {
            return NextResponse.json({ error: 'User or Store not found' }, { status: 404 });
        }

        const currentEndDate = user.store?.subscription?.endDate || new Date();
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + parseInt(days));

        const updated = await prisma.subscription.update({
            where: { storeId: user.storeId },
            data: {
                endDate: newEndDate,
                status: 'ACTIVE' // Ensure it's active if extended
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
