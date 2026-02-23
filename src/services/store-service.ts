import { prisma } from "@/lib/prisma";

export class StoreService {
    /**
     * Mengambil data ringkasan dashboard untuk Owner.
     */
    static async getDashboardStats(storeId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [salesToday, lowStockIngredients, topProducts] = await Promise.all([
            // Penjualan hari ini
            prisma.transaction.aggregate({
                where: { storeId, createdAt: { gte: today } },
                _sum: { totalAmount: true },
                _count: { id: true }
            }),
            // Bahan baku stok rendah (< 100 unit asumsi)
            prisma.ingredient.findMany({
                where: { storeId, stock: { lt: 100 } },
                take: 5
            }),
            // Produk terlaris (limit 5)
            prisma.transactionItem.groupBy({
                by: ['productId'],
                where: { transaction: { storeId } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            })
        ]);

        return {
            salesToday: salesToday._sum.totalAmount || 0,
            transactionCount: salesToday._count.id || 0,
            lowStockIngredients,
            topProducts
        };
    }

    /**
     * Mengambil profil toko.
     */
    static async getStoreProfile(storeId: string) {
        return await prisma.store.findUnique({
            where: { id: storeId },
            include: { subscription: true }
        });
    }

    /**
     * Memperbarui profil toko.
     */
    static async updateStoreProfile(storeId: string, data: { name?: string, address?: string, phone?: string }) {
        return await prisma.store.update({
            where: { id: storeId },
            data
        });
    }

    /**
     * Mengambil profil user.
     */
    static async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, storeId: true }
        });
    }

    /**
     * Memperbarui profil user.
     */
    static async updateUserProfile(userId: string, data: { name?: string, email?: string }) {
        return await prisma.user.update({
            where: { id: userId },
            data
        });
    }
}
