import { prisma } from "@/lib/prisma";

export class TransactionService {
    /**
     * Prosedur utama untuk memproses penjualan premium.
     * Menangani pemotongan stok bahan baku (untuk produk formula)
     * atau pemotongan stok produk langsung.
     */
    static async createTransaction(storeId: string, cashierName: string, items: { productId: string, quantity: number, isOwnBottle?: boolean, bottleId?: string }[]) {
        return await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const transactionItems = [];

            for (const item of items) {
                // 1. Ambil detail produk
                const product = await tx.product.findFirst({
                    where: { id: item.productId, storeId },
                    include: { formula: { include: { items: true } } }
                });

                if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);

                const subtotal = Number(product.price) * item.quantity;
                totalAmount += subtotal;

                // 2. Jika produk berbasis formula (racikan), potong stok bahan
                if (product.isFormula && product.formula) {
                    for (const formulaItem of product.formula.items) {
                        const neededQty = formulaItem.quantity * item.quantity;

                        if (formulaItem.ingredientId) {
                            // Potong stok Bahan Baku
                            const updateCount = await tx.ingredient.updateMany({
                                where: {
                                    id: formulaItem.ingredientId,
                                    storeId,
                                    stock: { gte: neededQty }
                                },
                                data: { stock: { decrement: neededQty } }
                            });

                            if (updateCount.count === 0) {
                                throw new Error(`Stok bahan baku '${formulaItem.ingredientId}' tidak mencukupi.`);
                            }
                        } else if (formulaItem.productId) {
                            // Potong stok Produk Lain (Unified ML logic)
                            const updateCount = await tx.product.updateMany({
                                where: {
                                    id: formulaItem.productId,
                                    storeId,
                                    stock: { gte: neededQty }
                                },
                                data: { stock: { decrement: neededQty } }
                            });

                            if (updateCount.count === 0) {
                                throw new Error(`Stok produk dasar '${formulaItem.productId}' tidak mencukupi.`);
                            }
                        }
                    }
                } else {
                    // 3. Jika produk reguler (bukan racikan), potong stok produk langsung
                    const updateCount = await tx.product.updateMany({
                        where: {
                            id: item.productId,
                            storeId,
                            stock: { gte: item.quantity }
                        },
                        data: { stock: { decrement: item.quantity } }
                    });

                    if (updateCount.count === 0) {
                        throw new Error(`Stok produk '${product.name}' tidak mencukupi.`);
                    }
                }

                // 4. Manajemen Botol (Jika bukan bawa sendiri dan botol ditentukan)
                if (!item.isOwnBottle && item.bottleId) {
                    const updateCount = await tx.ingredient.updateMany({
                        where: {
                            id: item.bottleId,
                            type: 'BOTOL',
                            storeId,
                            stock: { gte: item.quantity }
                        },
                        data: { stock: { decrement: item.quantity } }
                    });

                    if (updateCount.count === 0) {
                        throw new Error(`Stok botol tidak mencukupi.`);
                    }
                }

                transactionItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal,
                    isOwnBottle: !!item.isOwnBottle,
                    bottleId: item.bottleId || null
                });
            }

            // 5. Simpan record transaksi final
            return await tx.transaction.create({
                data: {
                    invoiceNumber: `ARX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    totalAmount,
                    cashierName,
                    storeId,
                    items: {
                        create: transactionItems
                    }
                },
                include: { items: true }
            });
        });
    }
}
