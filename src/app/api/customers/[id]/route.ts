import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        const { name, phone, email, notes } = await req.json();

        const updated = await prisma.customer.update({
            where: { id: params.id, storeId },
            data: { name, phone, email, notes }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const storeId = session.user.storeId as string;

        await prisma.customer.delete({
            where: { id: params.id, storeId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
