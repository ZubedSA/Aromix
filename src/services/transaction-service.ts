import { prisma } from "@/lib/prisma";

export class TransactionService {
    /**
     * Prosedur utama untuk memproses penjualan premium.
     * Menangani pemotongan stok bahan baku (untuk produk formula)
     * atau pemotongan stok produk langsung.
     */
    static async createTransaction(storeId: string, cashierName: string, items: { productId?: string, ingredientId?: string, quantity: number, isOwnBottle?: boolean, bottleId?: string }[], customerId?: string) {
        return await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const transactionItems = [];

            for (const item of items) {
                if (item.productId) {
                    const product = await tx.product.findFirst({
                        where: { id: item.productId, storeId },
                        include: { formula: { include: { items: true } } }
                    });

                    if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);

                    const subtotal = Number(product.price) * item.quantity;
                    totalAmount += subtotal;

                    if (product.isFormula && product.formula) {
                        for (const formulaItem of product.formula.items) {
                            const neededQty = formulaItem.quantity * item.quantity;
                            if (formulaItem.ingredientId) {
                                const updateCount = await tx.ingredient.updateMany({
                                    where: { id: formulaItem.ingredientId, storeId, stock: { gte: neededQty } },
                                    data: { stock: { decrement: neededQty } }
                                });
                                if (updateCount.count === 0) throw new Error(`Stok bahan baku '${formulaItem.ingredientId}' tidak mencukupi.`);
                            } else if (formulaItem.productId) {
                                const updateCount = await tx.product.updateMany({
                                    where: { id: formulaItem.productId, storeId, stock: { gte: neededQty } },
                                    data: { stock: { decrement: neededQty } }
                                });
                                if (updateCount.count === 0) throw new Error(`Stok produk dasar '${formulaItem.productId}' tidak mencukupi.`);
                            }
                        }
                    } else {
                        const updateCount = await tx.product.updateMany({
                            where: { id: item.productId, storeId, stock: { gte: item.quantity } },
                            data: { stock: { decrement: item.quantity } }
                        });
                        if (updateCount.count === 0) throw new Error(`Stok produk '${product.name}' tidak mencukupi.`);
                    }

                    if (!item.isOwnBottle && item.bottleId) {
                        const updateCount = await tx.ingredient.updateMany({
                            where: { id: item.bottleId, type: 'BOTOL', storeId, stock: { gte: item.quantity } },
                            data: { stock: { decrement: item.quantity } }
                        });
                        if (updateCount.count === 0) throw new Error(`Stok botol tidak mencukupi.`);
                    }

                    transactionItems.push({
                        productId: product.id,
                        ingredientId: null,
                        quantity: item.quantity,
                        price: product.price,
                        subtotal,
                        isOwnBottle: !!item.isOwnBottle,
                        bottleId: item.bottleId || null
                    });
                } else if (item.ingredientId) {
                    const ingredient = await tx.ingredient.findFirst({
                        where: { id: item.ingredientId, storeId }
                    });

                    if (!ingredient) throw new Error(`Bahan baku dengan ID ${item.ingredientId} tidak ditemukan.`);

                    const subtotal = Number(ingredient.price) * item.quantity;
                    totalAmount += subtotal;

                    // Potong stok bahan baku secara langsung
                    const updateCount = await tx.ingredient.updateMany({
                        where: { id: item.ingredientId, storeId, stock: { gte: item.quantity } },
                        data: { stock: { decrement: item.quantity } }
                    });

                    if (updateCount.count === 0) throw new Error(`Stok '${ingredient.name}' tidak mencukupi.`);

                    transactionItems.push({
                        productId: null,
                        ingredientId: ingredient.id,
                        quantity: item.quantity,
                        price: ingredient.price,
                        subtotal,
                        isOwnBottle: false,
                        bottleId: null
                    });
                }
            }

            return await tx.transaction.create({
                data: {
                    invoiceNumber: `ARX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    totalAmount,
                    cashierName,
                    storeId,
                    customerId: customerId || null,
                    items: {
                        create: transactionItems
                    }
                },
                include: { items: true }
            });
        });
    }
}
