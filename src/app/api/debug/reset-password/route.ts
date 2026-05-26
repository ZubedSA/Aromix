import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('istana123', 10);
        
        // Update user istanaparfum@gmail.com
        const updatedUser = await prisma.user.update({
            where: { email: 'istanaparfum@gmail.com' },
            data: { 
                password: hashedPassword,
                isApproved: true
            }
        });

        // Also update the others just in case they want to test owner.final@aromix.id and admin.final@aromix.id
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.updateMany({
            where: { email: { in: ['owner.final@aromix.id', 'admin.final@aromix.id'] } },
            data: {
                password: hashedAdminPassword,
                isApproved: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Password for istanaparfum@gmail.com has been reset to "istana123", and final accounts have been reset to "admin123" and approved!',
            user: {
                email: updatedUser.email,
                name: updatedUser.name,
                isApproved: updatedUser.isApproved
            }
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message
        }, { status: 500 });
    }
}
