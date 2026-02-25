const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const counts = {
            users: await prisma.user.count(),
            stores: await prisma.store.count(),
            products: await prisma.product.count(),
            ingredients: await prisma.ingredient.count(),
            transactions: await prisma.transaction.count(),
            transactionItems: await prisma.transactionItem.count(),
            customers: await prisma.customer.count(),
            suppliers: await prisma.supplier.count(),
        };
        console.log('JSON_START');
        console.log(JSON.stringify(counts, null, 2));
        console.log('JSON_END');
    } catch (e) {
        console.error('Stats Check Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
