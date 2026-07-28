import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = session.user.storeId;

    try {
        const [products, ingredients, customers] = await Promise.all([
            prisma.product.findMany({
                where: { storeId },
                include: {
                    formula: {
                        include: {
                            items: {
                                include: {
                                    ingredient: true,
                                    product: true
                                }
                            }
                        }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.ingredient.findMany({
                where: { storeId },
                orderBy: { name: 'asc' }
            }),
            prisma.customer.findMany({
                where: { storeId },
                orderBy: { name: 'asc' }
            })
        ]);

        return NextResponse.json({
            products,
            ingredients,
            customers
        });
    } catch (error: any) {
        console.error("POS Init Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
