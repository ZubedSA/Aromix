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

        const data = await req.json();
        const updated = await StoreService.updateStoreProfile(session.user.storeId, data);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
