import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const storeId = session.user.storeId as string;

    try {
        const products = await prisma.product.findMany({
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
        });

        return NextResponse.json(products);
    } catch (error: any) {
        console.error("GET Products Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, price, stock, isFormula, formulaItems } = await req.json();
    const storeId = session.user.storeId;

    try {
        const product = await prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    name,
                    price: parseFloat(price),
                    stock: parseFloat(stock),
                    isFormula,
                    storeId
                }
            });

            if (isFormula && formulaItems && formulaItems.length > 0) {
                await tx.formula.create({
                    data: {
                        productId: newProduct.id,
                        storeId,
                        items: {
                            create: formulaItems.map((fi: any) => ({
                                ingredientId: fi.ingredientId || null,
                                productId: fi.productId || null,
                                quantity: parseFloat(fi.quantity)
                            }))
                        }
                    }
                });
            }

            return newProduct;
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("POST Product Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
