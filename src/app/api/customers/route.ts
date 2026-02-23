import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const customers = await prisma.customer.findMany({
            where: { storeId },
            include: {
                _count: {
                    select: { transactions: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(customers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const { name, phone, email, notes } = await req.json();

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email,
                notes,
                storeId
            }
        });

        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
