import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Simple aggregation for reports
        // 1. Sales by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailySales = await prisma.transaction.groupBy({
            by: ['createdAt'],
            _sum: { totalAmount: true },
            where: {
                storeId: session.user.storeId,
                createdAt: { gte: sevenDaysAgo }
            },
            orderBy: { createdAt: 'asc' }
        });

        // 2. Top products
        const topProducts = await prisma.transactionItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true, subtotal: true },
            where: {
                transaction: { storeId: session.user.storeId }
            },
            take: 5,
            orderBy: { _sum: { quantity: 'desc' } }
        });

        // Resolve product names
        const productIds = topProducts
            .map(p => p.productId)
            .filter((id): id is string => id !== null);

        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true }
        });

        const formattedTopProducts = topProducts.map(tp => ({
            ...tp,
            name: products.find(p => p.id === tp.productId)?.name || 'Unknown'
        }));

        return NextResponse.json({
            dailySales,
            topProducts: formattedTopProducts
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
