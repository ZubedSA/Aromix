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
            const updatedProduct = await tx.product.update({
                where: { id: productId, storeId },
                data: {
                    name,
                    price: parseFloat(price),
                    stock: parseFloat(stock),
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
            }

            return updatedProduct;
        });

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
