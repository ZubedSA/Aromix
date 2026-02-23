import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const suppliers = await prisma.supplier.findMany({
            where: { storeId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(suppliers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const { name, contact, address } = await req.json();

        const supplier = await prisma.supplier.create({
            data: {
                name,
                contact,
                address,
                storeId
            }
        });

        return NextResponse.json(supplier);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
