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

        const stats = await AdminService.getGlobalStats();

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
