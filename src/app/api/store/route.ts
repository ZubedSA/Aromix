import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StoreService } from '@/services/store-service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const store = await StoreService.getStoreProfile(session.user.storeId);
        return NextResponse.json(store);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.storeId || session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Only allow valid fields to be updated
        const data: { name?: string; address?: string; phone?: string } = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.address !== undefined) data.address = body.address;
        if (body.phone !== undefined) data.phone = body.phone;

        const updated = await StoreService.updateStoreProfile(session.user.storeId, data);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('[API /store PUT]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
