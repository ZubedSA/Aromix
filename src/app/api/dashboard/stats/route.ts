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

        const stats = await StoreService.getDashboardStats(session.user.storeId);

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
