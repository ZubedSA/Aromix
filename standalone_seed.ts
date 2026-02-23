import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import bcrypt from 'bcryptjs'

// Setup Neon for Node.js
neonConfig.webSocketConstructor = ws

async function seed() {
    const DATABASE_URL = "postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

    console.log('Connecting to:', "ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech");

    const pool = new Pool({ connectionString: DATABASE_URL });
    const adapter = new PrismaNeon(pool as any);
    const prisma = new PrismaClient({ adapter });

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('Step 1: Creating/Finding Store...');
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
            console.log('Store created:', store.id);
        } else {
            console.log('Store exists:', store.id);
        }

        console.log('Step 2: Clearing old users...');
        await prisma.user.deleteMany({
            where: {
                email: { in: ['owner.final@aromix.id', 'admin.final@aromix.id'] }
            }
        });

        console.log('Step 3: Creating Owner Account...');
        const owner = await prisma.user.create({
            data: {
                email: 'owner.final@aromix.id',
                password: hashedPassword,
                name: 'Owner AROMIX (Final)',
                role: 'OWNER',
                storeId: store.id
            }
        });
        console.log('Owner created:', owner.email);

        console.log('Step 4: Creating Admin Account...');
        const admin = await prisma.user.create({
            data: {
                email: 'admin.final@aromix.id',
                password: hashedPassword,
                name: 'Super Admin (Final)',
                role: 'ADMIN',
                storeId: null
            }
        });
        console.log('Admin created:', admin.email);

        console.log('--- SEEDING COMPLETE SUCCESS ---');
    } catch (error) {
        console.error('CRITICAL SEEDING ERROR:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
        process.exit(0);
    }
}

seed();
