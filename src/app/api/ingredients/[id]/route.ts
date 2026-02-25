import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId;

        const ingredientId = params.id;

        // Check if ingredient belongs to user's store
        const ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientId }
        });

        if (!ingredient || ingredient.storeId !== storeId) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }

        await prisma.ingredient.delete({
            where: { id: ingredientId }
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
        const storeId = session.user.storeId;

        const ingredientId = params.id;
        const data = await req.json();

        const updated = await prisma.ingredient.update({
            where: { id: ingredientId, storeId },
            data: {
                name: data.name,
                unit: data.unit,
                stock: parseFloat(data.stock),
                type: data.type
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
