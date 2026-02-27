import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const productId = params.id;

        await prisma.product.delete({
            where: { id: productId, storeId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const productId = params.id;
        const { name, price, stock, isFormula, formulaItems } = await req.json();

        const product = await prisma.$transaction(async (tx) => {
            // Get old product and formula for stock reversal
            const oldProduct = await tx.product.findUnique({
                where: { id: productId, storeId },
                include: { formula: { include: { items: true } } }
            });

            if (!oldProduct) throw new Error("Product not found");

            let totalStock = parseFloat(stock);

            // 1. Reverse old stock if it was a formula
            if (oldProduct.isFormula && oldProduct.formula) {
                for (const item of oldProduct.formula.items) {
                    const qty = item.quantity;
                    if (item.ingredientId) {
                        await tx.ingredient.update({
                            where: { id: item.ingredientId },
                            data: { stock: { increment: qty } }
                        });
                    } else if (item.productId) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: qty } }
                        });
                    }
                }
            }

            // 2. Apply new stock deductions if it is a formula
            if (isFormula && formulaItems) {
                totalStock = formulaItems.reduce((sum: number, fi: any) => sum + parseFloat(fi.quantity), 0);

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

            const updatedProduct = await tx.product.update({
                where: { id: productId, storeId },
                data: {
                    name,
                    price: parseFloat(price),
                    stock: totalStock,
                    isFormula
                }
            });

            if (isFormula && formulaItems) {
                // Remove old formula and its items
                await tx.formula.deleteMany({ where: { productId } });

                await tx.formula.create({
                    data: {
                        productId,
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
            } else if (!isFormula && oldProduct.isFormula) {
                // If changed from formula to simple product, delete the formula
                await tx.formula.deleteMany({ where: { productId } });
            }

            return updatedProduct;
        });

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
