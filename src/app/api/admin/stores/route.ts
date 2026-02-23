import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services/admin-service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stores = await AdminService.getAllStores();

        return NextResponse.json(stores);
    } catch (error: any) {
        console.error('Admin Stores Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { storeId, status, endDate, planName } = await req.json();

        const updatedSub = await AdminService.updateSubscription(storeId, {
            status,
            endDate: new Date(endDate),
            planName
        });

        return NextResponse.json(updatedSub);
    } catch (error: any) {
        console.error('Admin Subscription Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
