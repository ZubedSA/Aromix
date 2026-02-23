import { prisma } from "@/lib/prisma";

export class AdminService {
    /**
     * Mengambil statistik global untuk seluruh sistem.
     */
    static async getGlobalStats() {
        const [totalStores, totalUsers, totalTransactions, totalRevenue] = await Promise.all([
            prisma.store.count(),
            prisma.user.count(),
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: { totalAmount: true }
            })
        ]);

        return {
            totalStores,
            totalUsers,
            totalTransactions,
            totalRevenue: totalRevenue._sum.totalAmount || 0
        };
    }

    /**
     * Mengambil daftar seluruh toko beserta status langganannya.
     */
    static async getAllStores() {
        return await prisma.store.findMany({
            include: {
                subscription: true,
                _count: {
                    select: { users: true, transactions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Memperbarui status langganan toko.
     */
    static async updateSubscription(storeId: string, data: { status: any, endDate: Date, planName?: string }) {
        return await prisma.subscription.upsert({
            where: { storeId },
            update: {
                status: data.status,
                endDate: data.endDate,
                planName: data.planName || "Silver"
            },
            create: {
                storeId,
                status: data.status,
                endDate: data.endDate,
                planName: data.planName || "Silver"
            }
        });
    }
}
