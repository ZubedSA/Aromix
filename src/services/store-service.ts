import { prisma } from "@/lib/prisma";

export class StoreService {
    /**
     * Mengambil data ringkasan dashboard untuk Owner.
     */
    static async getDashboardStats(storeId: string) {
        const offsetMs = 7 * 60 * 60 * 1000;
        const nowLocal = new Date(Date.now() + offsetMs);
        nowLocal.setUTCHours(0, 0, 0, 0);
        const today = new Date(nowLocal.getTime() - offsetMs);

        // Hitung 7 hari terakhir untuk tren penjualan
        const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

        const [transactionsToday, lowStockIngredients, topProductsRaw, transactionsWeek] = await Promise.all([
            // Transaksi hari ini dengan item-nya untuk menghitung omzet & laba
            prisma.transaction.findMany({
                where: { storeId, createdAt: { gte: today } },
                include: {
                    items: {
                        include: {
                            product: true,
                            ingredient: true
                        }
                    }
                }
            }),
            // Bahan baku stok rendah (< 100 unit asumsi)
            prisma.ingredient.findMany({
                where: { storeId, stock: { lt: 100 } },
                take: 5
            }),
            // Produk terlaris (limit 5) - groupBy hanya mengembalikan productId
            prisma.transactionItem.groupBy({
                by: ['productId'],
                where: { transaction: { storeId }, productId: { not: null } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }),
            // Transaksi 7 hari terakhir untuk grafik tren
            prisma.transaction.findMany({
                where: { storeId, createdAt: { gte: sevenDaysAgo } },
                select: { totalAmount: true, createdAt: true }
            })
        ]);

        const salesToday = transactionsToday.reduce((sum, tx) => sum + Number(tx.totalAmount), 0);
        const transactionCount = transactionsToday.length;
        const labaToday = transactionsToday.reduce((sum, tx) => {
            const txProfit = tx.items.reduce((itemSum, item) => {
                const purchasePrice = Number(item.purchasePrice) > 0 
                    ? Number(item.purchasePrice) 
                    : (Number(item.product?.purchasePrice || 0) || Number(item.ingredient?.purchasePrice || 0));
                const cost = purchasePrice * item.quantity;
                return itemSum + (Number(item.subtotal) - cost);
            }, 0);
            return sum + txProfit;
        }, 0);

        // Resolve nama produk terlaris
        const productIds = topProductsRaw
            .map(p => p.productId)
            .filter((id): id is string => id !== null);
        
        const products = productIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true }
            })
            : [];
        
        const productMap = new Map(products.map(p => [p.id, p.name]));
        const topProducts = topProductsRaw.map(p => ({
            productId: p.productId,
            name: productMap.get(p.productId!) || 'Produk Dihapus',
            totalSold: p._sum.quantity || 0
        }));

        // Bangun data tren penjualan 7 hari terakhir
        const salesTrend: { date: string; label: string; total: number; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            const dayLocal = new Date(dayStart.getTime() + offsetMs);
            const label = dayLocal.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
            const dateStr = dayLocal.toISOString().slice(0, 10);
            
            const dayTxs = transactionsWeek.filter(tx => 
                tx.createdAt >= dayStart && tx.createdAt < dayEnd
            );
            
            salesTrend.push({
                date: dateStr,
                label,
                total: dayTxs.reduce((sum, tx) => sum + Number(tx.totalAmount), 0),
                count: dayTxs.length
            });
        }

        return {
            salesToday,
            transactionCount,
            labaToday,
            lowStockIngredients,
            topProducts,
            salesTrend
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
