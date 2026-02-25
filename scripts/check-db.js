const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, name: true, role: true, isApproved: true }
        });
        console.log('--- USERS IN DB ---');
        users.forEach(u => console.log(`Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Approved: ${u.isApproved}`));

        const stores = await prisma.store.findMany({
            select: { id: true, name: true }
        });
        console.log('--- STORES IN DB ---');
        stores.forEach(s => console.log(`ID: ${s.id} | Name: ${s.name}`));

    } catch (e) {
        console.error('DB Check Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
