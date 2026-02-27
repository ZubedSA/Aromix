import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const storeId = session.user.storeId;

    const ingredients = await prisma.ingredient.findMany({
        where: { storeId },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json(ingredients);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const storeId = session.user.storeId;

    const { name, unit, stock, type, price } = await req.json();

    const ingredient = await prisma.ingredient.create({
        data: {
            name,
            unit,
            stock: parseFloat(stock),
            price: parseFloat(price) || 0,
            type: type || 'BIANG',
            storeId
        }
    });

    return NextResponse.json(ingredient);
}
