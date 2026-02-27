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
            let totalStock = parseFloat(stock);

            if (isFormula && formulaItems && formulaItems.length > 0) {
                // Calculate stock from formula items (sum of all components)
                totalStock = formulaItems.reduce((sum: number, fi: any) => sum + parseFloat(fi.quantity), 0);

                // Deduct stock from ingredients/products used in the formula
                for (const item of formulaItems) {
                    const qty = parseFloat(item.quantity);
                    if (item.ingredientId) {
                        await tx.ingredient.update({
                            where: { id: item.ingredientId },
                            data: { stock: { decrement: qty } }
                        });
                    } else if (item.productId) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: qty } }
                        });
                    }
                }
            }

            const newProduct = await tx.product.create({
                data: {
                    name,
                    price: parseFloat(price),
                    stock: totalStock,
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
