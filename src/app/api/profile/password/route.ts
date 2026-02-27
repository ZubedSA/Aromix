import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        // 1. Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        // 2. Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
