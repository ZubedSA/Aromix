import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { storeId } = params;

        // Fetch store details (only public fields)
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
            }
        });

        if (!store) {
            return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 });
        }

        // Fetch products (only public fields, NO purchasePrice/HPP)
        const products = await prisma.product.findMany({
            where: { storeId },
            select: {
                id: true,
                code: true,
                name: true,
                price: true,
                stock: true,
                isFormula: true,
            },
            orderBy: { name: 'asc' }
        });

        // Fetch ingredients with public price > 0 (e.g. sellable bottles/alcohol)
        const ingredients = await prisma.ingredient.findMany({
            where: { 
                storeId,
                price: { gt: 0 }
            },
            select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                type: true,
                unit: true,
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            store,
            products,
            ingredients
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
