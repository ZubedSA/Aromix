import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionService } from '@/services/transaction-service';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Item transaksi tidak valid.' }, { status: 400 });
        }

        const result = await TransactionService.createTransaction(
            session.user.storeId,
            session.user.name || 'Kasir',
            items
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
