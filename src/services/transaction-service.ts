import { prisma } from "@/lib/prisma";

export class TransactionService {
    /**
     * Prosedur utama untuk memproses penjualan premium.
     * Menggunakan batching & eksekusi paralel (Promise.all) untuk kecepatan sub-detik.
     */
    static async createTransaction(
        storeId: string,
        cashierName: string,
        items: { productId?: string, ingredientId?: string, quantity: number, isOwnBottle?: boolean, bottleId?: string }[],
        customerId?: string,
        paymentMethod?: string
    ) {
        return await prisma.$transaction(async (tx) => {
            const productIds = Array.from(new Set(items.filter(i => i.productId).map(i => i.productId as string)));
            const ingredientIds = Array.from(new Set(items.filter(i => i.ingredientId).map(i => i.ingredientId as string)));
            const bottleIds = Array.from(new Set(items.filter(i => !i.isOwnBottle && i.bottleId).map(i => i.bottleId as string)));

            const allIngredientIds = Array.from(new Set([...ingredientIds, ...bottleIds]));

            // Batch fetch all required products and ingredients in parallel
            const [products, ingredients] = await Promise.all([
                productIds.length > 0
                    ? tx.product.findMany({
                        where: { id: { in: productIds }, storeId },
                        include: { formula: { include: { items: true } } }
                    })
                    : [],
                allIngredientIds.length > 0
                    ? tx.ingredient.findMany({
                        where: { id: { in: allIngredientIds }, storeId }
                    })
                    : []
            ]);

            const productMap = new Map(products.map(p => [p.id, p]));
            const ingredientMap = new Map(ingredients.map(i => [i.id, i]));

            // Check if formulas reference additional sub-products or ingredients
            const extraProductIds: string[] = [];
            const extraIngredientIds: string[] = [];

            for (const p of products) {
                if (p.isFormula && p.formula) {
                    for (const fi of p.formula.items) {
                        if (fi.ingredientId && !ingredientMap.has(fi.ingredientId)) {
                            extraIngredientIds.push(fi.ingredientId);
                        }
                        if (fi.productId && !productMap.has(fi.productId)) {
                            extraProductIds.push(fi.productId);
                        }
                    }
                }
            }

            if (extraProductIds.length > 0 || extraIngredientIds.length > 0) {
                const [extraProducts, extraIngredients] = await Promise.all([
                    extraProductIds.length > 0
                        ? tx.product.findMany({ where: { id: { in: extraProductIds }, storeId } })
                        : [],
                    extraIngredientIds.length > 0
                        ? tx.ingredient.findMany({ where: { id: { in: extraIngredientIds }, storeId } })
                        : []
                ]);
                extraProducts.forEach(p => productMap.set(p.id, p as any));
                extraIngredients.forEach(i => ingredientMap.set(i.id, i as any));
            }

            let totalAmount = 0;
            const transactionItems = [];
            const ingredientDecrements = new Map<string, { name: string; amount: number }>();
            const productDecrements = new Map<string, { name: string; amount: number }>();

            for (const item of items) {
                if (item.productId) {
                    const product = productMap.get(item.productId);
                    if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);

                    let subtotal = Number(product.price) * item.quantity;

                    if (product.isFormula && product.formula) {
                        for (const formulaItem of product.formula.items) {
                            const neededQty = formulaItem.quantity * item.quantity;
                            if (formulaItem.ingredientId) {
                                const ing = ingredientMap.get(formulaItem.ingredientId);
                                const curr = ingredientDecrements.get(formulaItem.ingredientId) || { name: ing?.name || 'Bahan baku', amount: 0 };
                                ingredientDecrements.set(formulaItem.ingredientId, { name: curr.name, amount: curr.amount + neededQty });
                            } else if (formulaItem.productId) {
                                const subP = productMap.get(formulaItem.productId);
                                const curr = productDecrements.get(formulaItem.productId) || { name: subP?.name || 'Produk dasar', amount: 0 };
                                productDecrements.set(formulaItem.productId, { name: curr.name, amount: curr.amount + neededQty });
                            }
                        }
                    } else {
                        const curr = productDecrements.get(item.productId) || { name: product.name, amount: 0 };
                        productDecrements.set(item.productId, { name: curr.name, amount: curr.amount + item.quantity });
                    }

                    if (!item.isOwnBottle && item.bottleId) {
                        const bottle = ingredientMap.get(item.bottleId);
                        if (!bottle || bottle.type !== 'BOTOL') throw new Error(`Botol tidak ditemukan.`);

                        const curr = ingredientDecrements.get(item.bottleId) || { name: bottle.name, amount: 0 };
                        ingredientDecrements.set(item.bottleId, { name: curr.name, amount: curr.amount + item.quantity });

                        subtotal += Number(bottle.price) * item.quantity;
                    }

                    totalAmount += subtotal;

                    transactionItems.push({
                        productId: product.id,
                        ingredientId: null,
                        quantity: item.quantity,
                        price: product.price,
                        purchasePrice: product.purchasePrice,
                        subtotal,
                        isOwnBottle: !!item.isOwnBottle,
                        bottleId: item.bottleId || null
                    });
                } else if (item.ingredientId) {
                    const ingredient = ingredientMap.get(item.ingredientId);
                    if (!ingredient) throw new Error(`Bahan baku dengan ID ${item.ingredientId} tidak ditemukan.`);

                    const subtotal = Number(ingredient.price) * item.quantity;
                    totalAmount += subtotal;

                    const curr = ingredientDecrements.get(item.ingredientId) || { name: ingredient.name, amount: 0 };
                    ingredientDecrements.set(item.ingredientId, { name: curr.name, amount: curr.amount + item.quantity });

                    transactionItems.push({
                        productId: null,
                        ingredientId: ingredient.id,
                        quantity: item.quantity,
                        price: ingredient.price,
                        purchasePrice: ingredient.purchasePrice,
                        subtotal,
                        isOwnBottle: false,
                        bottleId: null
                    });
                }
            }

            // Eksekusi pemotongan stok secara paralel dengan Promise.all
            const updatePromises: Promise<any>[] = [];

            ingredientDecrements.forEach(({ name, amount }, ingId) => {
                updatePromises.push(
                    tx.ingredient.updateMany({
                        where: { id: ingId, storeId, stock: { gte: amount } },
                        data: { stock: { decrement: amount } }
                    }).then(res => {
                        if (res.count === 0) throw new Error(`Stok bahan baku '${name}' tidak mencukupi.`);
                    })
                );
            });

            productDecrements.forEach(({ name, amount }, prodId) => {
                updatePromises.push(
                    tx.product.updateMany({
                        where: { id: prodId, storeId, stock: { gte: amount } },
                        data: { stock: { decrement: amount } }
                    }).then(res => {
                        if (res.count === 0) throw new Error(`Stok produk '${name}' tidak mencukupi.`);
                    })
                );
            });

            await Promise.all(updatePromises);

            return await tx.transaction.create({
                data: {
                    invoiceNumber: `ARX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    totalAmount,
                    cashierName,
                    storeId,
                    customerId: customerId || null,
                    paymentMethod: paymentMethod || "TUNAI",
                    items: {
                        create: transactionItems
                    }
                },
                include: {
                    items: {
                        include: {
                            product: { select: { name: true, purchasePrice: true } },
                            ingredient: { select: { name: true, purchasePrice: true } }
                        }
                    },
                    customer: true
                }
            });
        }, {
            maxWait: 10000,
            timeout: 20000
        });
    }
}
