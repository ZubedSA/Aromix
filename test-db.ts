import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== USERS ===");
    const users = await prisma.user.findMany();
    console.dir(users, { depth: null });

    console.log("\n=== STORES ===");
    const stores = await prisma.store.findMany({
        include: { subscription: true }
    });
    console.dir(stores, { depth: null });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
