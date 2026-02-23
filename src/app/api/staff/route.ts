import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.user.findMany({
        where: {
            storeId: session.user.storeId,
            role: 'CASHIER'
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return NextResponse.json(staff);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'CASHIER',
            storeId: session.user.storeId as string,
        }
    });

    return NextResponse.json(staff);
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const staffId = searchParams.get('id');

        if (!staffId) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.user.delete({
            where: {
                id: staffId,
                storeId: session.user.storeId,
                role: 'CASHIER'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
