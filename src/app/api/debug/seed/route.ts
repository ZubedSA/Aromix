import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // 1. Create a Premium Store
        let store = await prisma.store.findFirst({
            where: { name: 'AROMIX Signature' }
        });

        if (!store) {
            store = await prisma.store.create({
                data: {
                    name: 'AROMIX Signature',
                    address: 'Fintech Tower Lt. 24, Jakarta',
                    phone: '08123456789',
                    subscription: {
                        create: {
                            status: 'ACTIVE',
                            planName: 'Gold Premium',
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        }
                    }
                }
            });
        }

        // 2. Clear previous test attempts
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['owner.final@aromix.id', 'admin.final@aromix.id']
                }
            }
        });

        // 3. Create Fresh Owner Account
        await prisma.user.create({
            data: {
                email: 'owner.final@aromix.id',
                password: hashedPassword,
                name: 'Owner AROMIX (Final)',
                role: 'OWNER',
                storeId: store.id
            }
        });

        // 4. Create Fresh Admin Account
        await prisma.user.create({
            data: {
                email: 'admin.final@aromix.id',
                password: hashedPassword,
                name: 'Super Admin (Final)',
                role: 'ADMIN',
                storeId: null
            }
        });

        return NextResponse.json({
            message: 'Re-Seeding Success - Akun Final Telah Dibuat!',
            credentials: {
                owner: { email: 'owner.final@aromix.id', password: 'admin123' },
                admin: { email: 'admin.final@aromix.id', password: 'admin123' }
            }
        });
    } catch (error: any) {
        console.error('Seeding Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            prisma_details: "Pastikan DATABASE_URL sudah benar dan terbaca."
        }, { status: 500 });
    }
}
