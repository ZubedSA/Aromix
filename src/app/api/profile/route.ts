import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StoreService } from '@/services/store-service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await StoreService.getUserProfile(session.user.id);
        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(profile);
    } catch (error: any) {
        console.error('[API /profile GET]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}


export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const data: { name?: string; email?: string } = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.email !== undefined) data.email = body.email;

        const updated = await StoreService.updateUserProfile(session.user.id, data);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('[API /profile PUT]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
