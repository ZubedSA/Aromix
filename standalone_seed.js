const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const bcrypt = require('bcryptjs');

neonConfig.webSocketConstructor = ws;

async function seed() {
    const DATABASE_URL = "postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

    console.log('Connecting via Prisma Adapter...');
    const pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('Finding/Creating Store...');
        const store = await prisma.store.upsert({
            where: { name: 'AROMIX Signature' },
            update: {},
            create: {
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
        console.log('Store ID:', store.id);

        console.log('Creating Owner Account...');
        await prisma.user.upsert({
            where: { email: 'owner.final@aromix.id' },
            update: { password: hashedPassword },
            create: {
                email: 'owner.final@aromix.id',
                password: hashedPassword,
                name: 'Owner AROMIX (Final)',
                role: 'OWNER',
                storeId: store.id
            }
        });

        console.log('Creating Admin Account...');
        await prisma.user.upsert({
            where: { email: 'admin.final@aromix.id' },
            update: { password: hashedPassword },
            create: {
                email: 'admin.final@aromix.id',
                password: hashedPassword,
                name: 'Super Admin (Final)',
                role: 'ADMIN',
                storeId: null
            }
        });

        console.log('--- SEEDING SUCCESS ---');
    } catch (error) {
        console.error('SEEDING FAIL:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

seed();
