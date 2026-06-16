import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const urlObj = new URL(req.url);
        const startDateParam = urlObj.searchParams.get('startDate');
        const endDateParam = urlObj.searchParams.get('endDate');

        // Offset for Asia/Jakarta is UTC+7
        const offsetMs = 7 * 60 * 60 * 1000;

        let start: Date;
        let end: Date;

        if (startDateParam) {
            start = new Date(`${startDateParam}T00:00:00+07:00`);
        } else {
            // Default: 6 days ago in Jakarta local time
            const nowLocal = new Date(Date.now() + offsetMs);
            nowLocal.setUTCHours(0, 0, 0, 0);
            start = new Date(nowLocal.getTime() - offsetMs - 6 * 24 * 60 * 60 * 1000);
        }

        if (endDateParam) {
            end = new Date(`${endDateParam}T23:59:59.999+07:00`);
        } else {
            const nowLocal = new Date(Date.now() + offsetMs);
            nowLocal.setUTCHours(23, 59, 59, 999);
            end = new Date(nowLocal.getTime() - offsetMs);
        }

        // Safety limit: max 366 days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 366) {
            end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000 + (23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59999));
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                storeId: session.user.storeId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                purchasePrice: true
                            }
                        },
                        ingredient: {
                            select: {
                                name: true,
                                purchasePrice: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by day using a Map to keep chronological order
        const dailyMap = new Map<string, { date: Date; totalAmount: number; totalProfit: number }>();
        
        // Initialize Map with 0 for each day in range
        const temp = new Date(start);
        while (temp <= end) {
            const localTemp = new Date(temp.getTime() + offsetMs);
            const yyyy = localTemp.getUTCFullYear();
            const mm = String(localTemp.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(localTemp.getUTCDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            dailyMap.set(dateStr, { date: new Date(temp), totalAmount: 0, totalProfit: 0 });
            temp.setDate(temp.getDate() + 1);
        }

        for (const tx of transactions) {
            const txLocalDate = new Date(tx.createdAt.getTime() + offsetMs);
            const yyyy = txLocalDate.getUTCFullYear();
            const mm = String(txLocalDate.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(txLocalDate.getUTCDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            let daily = dailyMap.get(dateStr);
            if (!daily) {
                const dayStart = new Date(tx.createdAt);
                const localOffset = (tx.createdAt.getTime() + offsetMs) % (24 * 60 * 60 * 1000);
                dayStart.setTime(tx.createdAt.getTime() - localOffset);
                daily = { date: dayStart, totalAmount: 0, totalProfit: 0 };
                dailyMap.set(dateStr, daily);
            }
            
            daily.totalAmount += Number(tx.totalAmount);
            
            for (const item of tx.items) {
                const purchasePrice = Number(item.purchasePrice) > 0 
                    ? Number(item.purchasePrice) 
                    : (Number(item.product?.purchasePrice || 0) || Number(item.ingredient?.purchasePrice || 0));
                const cost = purchasePrice * item.quantity;
                const profit = Number(item.subtotal) - cost;
                daily.totalProfit += profit;
            }
        }

        const dailySales = Array.from(dailyMap.values()).map(d => ({
            createdAt: d.date,
            _sum: {
                totalAmount: d.totalAmount,
                totalProfit: d.totalProfit
            }
        }));

        // 2. Top products filtered by date range
        const topProducts = await prisma.transactionItem.groupBy({
            by: ['productId', 'ingredientId'],
            _sum: { quantity: true, subtotal: true },
            where: {
                transaction: { 
                    storeId: session.user.storeId,
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                }
            },
            take: 5,
            orderBy: { _sum: { quantity: 'desc' } }
        });

        // Resolve product and ingredient names
        const productIds = topProducts
            .map(p => p.productId)
            .filter((id): id is string => id !== null);

        const ingredientIds = topProducts
            .map(p => p.ingredientId)
            .filter((id): id is string => id !== null);

        const [products, ingredients] = await Promise.all([
            prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true }
            }),
            prisma.ingredient.findMany({
                where: { id: { in: ingredientIds } },
                select: { id: true, name: true }
            })
        ]);

        const formattedTopProducts = topProducts.map(tp => {
            let name = 'Unknown';
            if (tp.productId) {
                name = products.find(p => p.id === tp.productId)?.name || 'Unknown';
            } else if (tp.ingredientId) {
                name = ingredients.find(i => i.id === tp.ingredientId)?.name || 'Unknown';
            }
            return {
                ...tp,
                name
            };
        });

        return NextResponse.json({
            dailySales,
            topProducts: formattedTopProducts,
            transactions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
