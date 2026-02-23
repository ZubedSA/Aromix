import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create a Premium Store
    const store = await prisma.store.create({
        data: {
            name: 'AROMIX Signature',
            address: 'Fintech Tower Lt. 24, Jakarta',
            phone: '08123456789',
            subscription: {
                create: {
                    status: 'ACTIVE',
                    planName: 'Gold Premium',
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                }
            }
        }
    });

    // 2. Create Owner Account
    const owner = await prisma.user.create({
        data: {
            email: 'owner@aromix.id',
            password: hashedPassword,
            name: 'Budi Aromix',
            role: 'OWNER',
            storeId: store.id
        }
    });

    // 3. Create Sample Ingredients
    await prisma.ingredient.createMany({
        data: [
            { name: 'Biang Ocean Breeze', unit: 'ml', stock: 500, storeId: store.id },
            { name: 'Alkohol 96%', unit: 'ml', stock: 2000, storeId: store.id },
            { name: 'Fixative', unit: 'ml', stock: 100, storeId: store.id },
        ]
    });

    console.log('--- SEEDING SELESAI ---');
    console.log('Store ID:', store.id);
    console.log('Email Login:', owner.email);
    console.log('Password:', 'admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
